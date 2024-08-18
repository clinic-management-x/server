import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Supplier, SupplierDocument } from "./schemas/supplier.schema";
import { Model } from "mongoose";
import { CreateSupplierDto, MRDto } from "./dto/create-supplier.dto";
import { ObjectId, ObjectList } from "src/shared/typings";
import {
    MedicalRepresentative,
    MedicalRepresentativeDocument,
} from "./schemas/medrepresentaive.schema";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { UpdateMRDto } from "./dto/update-mr.dto";
import { FilesService } from "src/files/files.service";
import { GetSuppliersDto } from "./dto/get-suppliers.dto";

@Injectable()
export class SuppliersService {
    constructor(
        @InjectModel(Supplier.name) private supplierModel: Model<Supplier>,
        @InjectModel(MedicalRepresentative.name)
        private MRModel: Model<MedicalRepresentative>,
        private filesService: FilesService
    ) {}

    async getAll(
        query: GetSuppliersDto,
        clinicId: ObjectId
    ): Promise<ObjectList<object>> {
        const filter = {
            ...(query.search
                ? { name: { $regex: query.search, $options: "i" } }
                : {}),

            clinic: clinicId,
        };

        const suppliers = await Promise.all(
            await this.supplierModel
                .find(filter)
                .skip(query.skip)
                .limit(query.limit)
                .populate("medRepresentatives")
                .exec()
        );

        await Promise.all(
            suppliers.map(async (supplier) => {
                if (supplier.avatarUrl) {
                    const presignedUrl =
                        await this.filesService.createPresignedUrl(
                            supplier.avatarUrl
                        );
                    return (supplier.avatarUrl = presignedUrl);
                }
            })
        );

        return { data: suppliers };
    }

    async get(_id: ObjectId, clinicId: ObjectId): Promise<object> {
        const supplier = await this.supplierModel
            .findOne({
                _id,
                clinic: clinicId,
            })
            .populate("medRepresentatives")
            .exec();
        if (supplier.avatarUrl) {
            supplier.avatarUrl = await this.filesService.createPresignedUrl(
                supplier.avatarUrl
            );
        }
        if (!supplier)
            throw new NotFoundException("Supplier Company Not Found.");

        return supplier;
    }

    async create(
        data: CreateSupplierDto,
        clinicId: ObjectId
    ): Promise<SupplierDocument> {
        const s3AvatarUrl = data.company.avatarUrl;
        if (s3AvatarUrl) {
            await this.filesService.checkFilesByUrls([s3AvatarUrl], clinicId);
        }
        let medRepresentatives;

        if (data.representatives.length) {
            medRepresentatives = await this.MRModel.insertMany(
                data.representatives.map((representative) => ({
                    ...representative,
                    clinic: clinicId,
                }))
            );
        }

        const supplierCompany = await this.supplierModel.create({
            ...data.company,
            clinic: clinicId,
            medRepresentatives: medRepresentatives.length
                ? medRepresentatives.map((data) => data._id)
                : [],
        });

        return supplierCompany;
    }

    async createMR(data: MRDto, clinicId: ObjectId): Promise<SupplierDocument> {
        const supplierCompany = await this.supplierModel
            .findOne({ _id: data._id, clinic: clinicId })
            .exec();
        if (!supplierCompany)
            throw new NotFoundException("Supplier Company not found.");
        const representative = await this.MRModel.create({
            ...data.mr,
            clinic: clinicId,
            supplierCompany: supplierCompany._id,
        });
        const supplier = await this.supplierModel.findOne({ _id: data._id });

        supplier.medRepresentatives = [
            ...supplier.medRepresentatives,
            representative._id,
        ];

        const updatedSupplier = (await supplier.save()).populate(
            "medRepresentatives"
        );

        return updatedSupplier;
    }

    async updateSupplier(
        _id: ObjectId,
        updateDto: UpdateSupplierDto,
        clinicId: ObjectId
    ): Promise<SupplierDocument> {
        const supplierCompany = await this.supplierModel
            .findOne({ _id, clinic: clinicId })
            .populate("medRepresentatives")
            .exec();
        if (!supplierCompany)
            throw new NotFoundException("Supplier Company not found.");

        const s3AvatarUrl = updateDto.avatarUrl;
        if (s3AvatarUrl) {
            await this.filesService.checkFilesByUrls([s3AvatarUrl], clinicId);
        }
        // Remove existing URL?
        if (
            s3AvatarUrl &&
            supplierCompany.avatarUrl &&
            s3AvatarUrl !== supplierCompany.avatarUrl
        ) {
            await this.filesService.deleteFiles([supplierCompany.avatarUrl]);
        }

        Object.keys(updateDto).map(
            (key) => (supplierCompany[key] = updateDto[key])
        );
        const updatedSupplier = (await supplierCompany.save()).populate(
            "medRepresentatives"
        );
        return updatedSupplier;
    }

    async updateSupplierRepresentaive(
        _id: ObjectId,
        updateDto: UpdateMRDto,
        clinicId: ObjectId
    ): Promise<MedicalRepresentativeDocument> {
        const representative = await this.MRModel.findOne({
            _id,
            clinic: clinicId,
        });
        if (!representative)
            throw new NotFoundException("Supplier Company not found.");
        Object.keys(updateDto).map(
            (key) => (representative[key] = updateDto[key])
        );
        const updatedRepresentative = await representative.save();
        return updatedRepresentative;
    }

    async deleteSupplier(_id: ObjectId, clinicId: ObjectId): Promise<object> {
        const supplierCompany = await this.supplierModel
            .findOne({ _id, clinic: clinicId })
            .exec();
        if (!supplierCompany)
            throw new NotFoundException("Supplier Company not found.");
        await this.MRModel.deleteMany({
            supplierCompany: _id,
            clinic: clinicId,
        }).exec();
        await this.supplierModel.deleteOne({ _id }).exec();
        return { deleteCount: 1 };
    }

    async deleteMR(
        _id: ObjectId,
        supplier_id: ObjectId,
        clinicId: ObjectId
    ): Promise<object> {
        const representative = await this.MRModel.findOne({
            _id,
            clinic: clinicId,
        });
        if (!representative)
            throw new NotFoundException("Medical Representative not found.");

        const supplier = await this.supplierModel.findOne({ _id: supplier_id });

        supplier.medRepresentatives = supplier.medRepresentatives.filter(
            (mr_id) => mr_id.toString() !== _id
        );

        (await supplier.save()).populate("medRepresentatives");

        await this.MRModel.deleteOne({ _id, clinic: clinicId }).exec();

        return supplier;
    }
}
