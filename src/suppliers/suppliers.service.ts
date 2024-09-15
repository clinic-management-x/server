import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Supplier, SupplierDocument } from "./schemas/supplier.schema";
import { Model } from "mongoose";
import { CreateSupplierDto, MRDto } from "./dto/create-supplier.dto";
import { ObjectId } from "src/shared/typings";
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

    async getAll(query: GetSuppliersDto, clinicId: ObjectId): Promise<object> {
        const filter = {
            ...(query.search
                ? { name: { $regex: query.search, $options: "i" } }
                : {}),

            clinic: clinicId,
        };

        const [data, count] = await Promise.all([
            this.supplierModel
                .find(filter)
                .skip(query.skip)
                .limit(query.limit)
                .populate("medRepresentatives")
                .exec(),
            this.supplierModel.find(filter).countDocuments(),
        ]);

        await Promise.all(
            data.map(async (supplier) => {
                if (supplier.avatarUrl) {
                    const presignedUrl =
                        await this.filesService.createPresignedUrl(
                            supplier.avatarUrl
                        );
                    return (supplier.avatarUrl = presignedUrl);
                }
            })
        );

        return { data, count };
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

    async getSupplierList(clinicId: ObjectId): Promise<object> {
        const suppliers = await this.supplierModel
            .find({ clinic: clinicId }, { _id: 1, name: 1 })
            .exec();
        return suppliers;
    }

    async create(
        data: CreateSupplierDto,
        clinicId: ObjectId
    ): Promise<SupplierDocument> {
        const session = await this.supplierModel.startSession();
        session.startTransaction();
        try {
            const s3AvatarUrl = data.company.avatarUrl;
            if (s3AvatarUrl) {
                await this.filesService.checkFilesByUrls(
                    [s3AvatarUrl],
                    clinicId
                );
            }
            let medRepresentatives = [];

            if (data?.representatives?.length) {
                medRepresentatives = await this.MRModel.insertMany(
                    data.representatives.map((representative) => ({
                        ...representative,
                        clinic: clinicId,
                    })),
                    { session }
                );
            }
            const supplierCompany = new this.supplierModel({
                ...data.company,
                clinic: clinicId,
                medRepresentatives: medRepresentatives?.length
                    ? medRepresentatives.map((data) => data._id)
                    : [],
            });
            await supplierCompany.save({ session });

            await session.commitTransaction();
            session.endSession();

            return supplierCompany;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }

    async createMR(data: MRDto, clinicId: ObjectId): Promise<SupplierDocument> {
        const session = await this.supplierModel.startSession();
        session.startTransaction();
        try {
            const supplierCompany = await this.supplierModel
                .findOne({ _id: data._id, clinic: clinicId }, null, { session })
                .exec();
            if (!supplierCompany)
                throw new NotFoundException("Supplier Company not found.");
            const representative = new this.MRModel({
                ...data.mr,
                clinic: clinicId,
                supplierCompany: supplierCompany._id,
            });
            await representative.save({ session });

            const supplier = await this.supplierModel.findOne(
                {
                    _id: data._id,
                },
                null,
                { session }
            );

            supplier.medRepresentatives = [
                ...supplier.medRepresentatives,
                representative._id,
            ];

            const updatedSupplier = (await supplier.save({ session })).populate(
                "medRepresentatives"
            );

            await session.commitTransaction();
            session.endSession();

            return updatedSupplier;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
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
        const session = await this.supplierModel.startSession();
        session.startTransaction();
        try {
            const supplierCompany = await this.supplierModel
                .findOne({ _id, clinic: clinicId }, null, { session })
                .exec();
            if (!supplierCompany)
                throw new NotFoundException("Supplier Company not found.");
            await this.MRModel.deleteMany(
                {
                    supplierCompany: _id,
                    clinic: clinicId,
                },
                { session }
            ).exec();
            await this.supplierModel.deleteOne({ _id }, { session }).exec();
            await session.commitTransaction();
            session.endSession();
            return { deleteCount: 1 };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }

    async deleteMR(
        _id: ObjectId,
        supplier_id: ObjectId,
        clinicId: ObjectId
    ): Promise<object> {
        const session = await this.supplierModel.startSession();
        session.startTransaction();
        try {
            const representative = await this.MRModel.findOne(
                {
                    _id,
                    clinic: clinicId,
                },
                null,
                { session }
            );
            if (!representative)
                throw new NotFoundException(
                    "Medical representative not found."
                );

            const supplier = await this.supplierModel.findOne(
                {
                    _id: supplier_id,
                },
                null,
                { session }
            );

            supplier.medRepresentatives = supplier.medRepresentatives.filter(
                (mr_id) => mr_id.toString() !== _id
            );

            (await supplier.save({ session })).populate("medRepresentatives");

            await this.MRModel.deleteOne(
                { _id, clinic: clinicId },
                { session }
            ).exec();
            await session.commitTransaction();
            session.endSession();
            return supplier;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }
}
