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

type SupplierType = {
    supplier: SupplierDocument;
    medRepresentatives?: MedicalRepresentativeDocument[];
};

@Injectable()
export class SuppliersService {
    constructor(
        @InjectModel(Supplier.name) private supplierModel: Model<Supplier>,
        @InjectModel(MedicalRepresentative.name)
        private MRModel: Model<MedicalRepresentative>,
        private filesService: FilesService
    ) {}

    async getAll(clinicId: ObjectId): Promise<ObjectList<SupplierType>> {
        const suppliers = await this.supplierModel
            .find({ clinic: clinicId })
            .exec();

        const data = await Promise.all(
            suppliers.map(async (supplier) => {
                const medRepresentatives = await this.MRModel.find({
                    supplierCompany: supplier._id,
                }).exec();

                return {
                    supplier: supplier,
                    medRepresentatives,
                };
            })
        );

        return { data };
    }

    async get(_id: ObjectId, clinicId: ObjectId): Promise<SupplierType> {
        const supplier = await this.supplierModel
            .findOne({
                _id,
                clinic: clinicId,
            })
            .exec();
        if (!supplier)
            throw new NotFoundException("Supplier Company Not Found.");
        const medRepresentatives = await this.MRModel.find({
            clinic: clinicId,
            supplierCompany: supplier._id,
        }).exec();
        return { supplier, medRepresentatives };
    }

    async create(
        data: CreateSupplierDto,
        clinicId: ObjectId
    ): Promise<SupplierDocument> {
        const s3AvatarUrl = data.company.avatar;
        if (s3AvatarUrl) {
            await this.filesService.checkFilesByUrls([s3AvatarUrl], clinicId);
        }

        const supplierCompany = await this.supplierModel.create({
            ...data.company,
            clinic: clinicId,
        });

        if (supplierCompany && data.representatives.length) {
            this.MRModel.insertMany(
                data.representatives.map((representative) => ({
                    ...representative,
                    supplierCompany: supplierCompany._id,
                    clinic: clinicId,
                }))
            );
        }

        return supplierCompany;
    }

    async createMR(
        data: MRDto,
        clinicId: ObjectId
    ): Promise<MedicalRepresentativeDocument> {
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
        return representative;
    }

    async updateSupplier(
        _id: ObjectId,
        updateDto: UpdateSupplierDto,
        clinicId: ObjectId
    ): Promise<SupplierDocument> {
        const supplierCompany = await this.supplierModel
            .findOne({ _id, clinic: clinicId })
            .exec();
        if (!supplierCompany)
            throw new NotFoundException("Supplier Company not found.");

        const s3AvatarUrl = updateDto.avatar;
        if (s3AvatarUrl) {
            await this.filesService.checkFilesByUrls([s3AvatarUrl], clinicId);
        }
        // Remove existing URL?
        if (
            s3AvatarUrl &&
            supplierCompany.avatar &&
            s3AvatarUrl !== supplierCompany.avatar
        ) {
            await this.filesService.deleteFiles([supplierCompany.avatar]);
        }

        Object.keys(updateDto).map(
            (key) => (supplierCompany[key] = updateDto[key])
        );
        const updatedSupplier = await supplierCompany.save();
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

    async deleteMR(_id: ObjectId, clinicId: ObjectId): Promise<object> {
        const representative = await this.MRModel.findOne({
            _id,
            clinic: clinicId,
        });
        if (!representative)
            throw new NotFoundException("Supplier Company not found.");
        await this.MRModel.deleteOne({ _id, clinic: clinicId }).exec();
        return { deleteCount: 1 };
    }
}
