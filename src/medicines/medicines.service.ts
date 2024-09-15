import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Medicine, MedicineDocument } from "./schemas/medicine.schema";
import { Model } from "mongoose";
import {
    GenericDrug,
    GenericDrugDocument,
} from "./schemas/generic-drug.schema";
import { GetDrugInfoDto } from "src/shared/dto/get-drug-info.dto";
import {
    ActiveIngredient,
    ActiveIngredientComponent,
    ActiveIngredientDocument,
} from "./schemas/active-ingredient.schema";
import {
    ActiveIngredientCreateDto,
    CreateMedicineDto,
} from "./dto/create-medicine.dto";
import { ObjectId } from "src/shared/typings";
import { GetMedicinesDto } from "./dto/get-medicines.dto";
import { FilesService } from "src/files/files.service";
import {
    UpdateActiveIngredientDto,
    UpdateMedicineDto,
} from "./dto/update-medicine.dto";

const populateQuery = [
    {
        path: "genericDrug",
    },
    {
        path: "activeIngredients",
        populate: {
            path: "activeIngredient",
        },
    },
];
@Injectable()
export class MedicinesService {
    constructor(
        @InjectModel(Medicine.name) private medicineModel: Model<Medicine>,
        @InjectModel(GenericDrug.name)
        private genericDrugModel: Model<GenericDrug>,
        @InjectModel(ActiveIngredient.name)
        private activeIngredientModel: Model<ActiveIngredient>,
        @InjectModel(ActiveIngredientComponent.name)
        private activeIngredientComponentModel: Model<ActiveIngredientComponent>,
        private filesService: FilesService
    ) {}

    async getAllGenericDrugs(
        query: GetDrugInfoDto
    ): Promise<{ data: GenericDrugDocument[]; count: number }> {
        const { search } = query;
        const filter = {
            genericName: {
                $regex: search,
                $options: "i",
            },
        };

        const [data, count] = await Promise.all([
            this.genericDrugModel.find(filter).skip(0).limit(20).exec(),
            this.genericDrugModel.find(filter).countDocuments(),
        ]);

        return { data, count };
    }
    async getAllActiveIngridients(
        query: GetDrugInfoDto
    ): Promise<{ data: ActiveIngredientDocument[]; count: number }> {
        const { search } = query;
        const filter = {
            activeIngredientName: {
                $regex: search,
                $options: "i",
            },
        };
        const [data, count] = await Promise.all([
            this.activeIngredientModel.find(filter).skip(0).limit(20).exec(),
            this.activeIngredientModel.find(filter).countDocuments(),
        ]);

        return { data, count };
    }

    async getAllMedicines(
        query: GetMedicinesDto,
        clinicId: ObjectId
    ): Promise<{ data: MedicineDocument[]; count: number }> {
        const filter = {
            ...(query.search
                ? { brandName: { $regex: query.search, $options: "i" } }
                : {}),

            clinic: clinicId,
        };

        const [data, count] = await Promise.all([
            this.medicineModel
                .find(filter)
                .skip(query.skip)
                .limit(query.limit)
                .populate(populateQuery)
                .exec(),
            this.medicineModel.find(filter).countDocuments(),
        ]);

        await Promise.all(
            data.map(async (medicine) => {
                if (medicine.imageUrls) {
                    const urls = await this.genereatePresignedUrls(
                        medicine.imageUrls
                    );
                    medicine.imageUrls = urls.map((urldata) => urldata.preview);
                }
            })
        );

        return {
            data,
            count,
        };
    }

    async getMedicinesList(
        query: GetDrugInfoDto,
        clinicId: ObjectId
    ): Promise<object> {
        const { search } = query;
        const filter = {
            brandName: {
                $regex: search,
                $options: "i",
            },
            clinic: clinicId,
        };

        const suppliers = await this.medicineModel
            .find(filter)
            .select(["_id", "brandName", "stockQuantityUnit"])
            .exec();
        return suppliers;
    }

    async getMedicine(
        _id: ObjectId,
        clinicId: ObjectId
    ): Promise<{
        medicine: MedicineDocument;
        imageArray: { preview: string; actual: string }[];
    }> {
        const medicine = await this.medicineModel
            .findOne({ _id: _id, clinic: clinicId })
            .populate(populateQuery)
            .exec();
        let imageArray = [];
        if (!medicine) throw new NotFoundException("Medicine Not Found.");
        if (medicine.imageUrls) {
            const urls = await this.genereatePresignedUrls(medicine.imageUrls);
            medicine.imageUrls = urls.map((urldata) => urldata.preview);
            imageArray = urls;
        }

        return { medicine, imageArray };
    }

    async genereatePresignedUrls(
        urls: string[]
    ): Promise<{ preview: string; actual: string }[]> {
        const presignedUrls = urls.map(async (image) => {
            return {
                preview: await this.filesService.createPresignedUrl(image),
                actual: image,
            };
        });
        return await Promise.all(presignedUrls);
    }

    async createMedicine(
        createMedicineDto: CreateMedicineDto,
        clinicId: ObjectId
    ): Promise<MedicineDocument> {
        const session = await this.medicineModel.startSession();
        session.startTransaction();
        try {
            const activeIngredients =
                await this.activeIngredientComponentModel.insertMany(
                    createMedicineDto.activeIngredients.map((ingredient) => {
                        return {
                            activeIngredient: ingredient._id,
                            unit: ingredient.unit,
                            strength: ingredient.strength,
                        };
                    }),
                    { session }
                );

            const data = {
                ...createMedicineDto,
                activeIngredients: activeIngredients.map(
                    (ingridient) => ingridient._id
                ),
                clinic: clinicId,
            };
            const medicine = new this.medicineModel(data);
            await medicine.save({ session });
            await session.commitTransaction();
            session.endSession();
            return medicine.populate(populateQuery);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }

    async updateMedicine(
        medicineId: ObjectId,
        updateMedicineDto: UpdateMedicineDto,
        clinicId: ObjectId
    ): Promise<MedicineDocument> {
        const medicineToUpdate = await this.medicineModel.findOne({
            _id: medicineId,
            clinic: clinicId,
        });
        if (!medicineToUpdate)
            throw new NotFoundException("Medicine Not Found.");

        if (updateMedicineDto.imageUrls) {
            const s3AvatarUrls = updateMedicineDto.imageUrls.map(
                (urldata) => urldata.actual
            );
            if (s3AvatarUrls.length) {
                await this.filesService.checkFilesByUrls(
                    s3AvatarUrls,
                    clinicId
                );
            }

            medicineToUpdate.imageUrls = updateMedicineDto.imageUrls.map(
                (urldata) => urldata.actual
            );
        } else {
            Object.keys(updateMedicineDto).map((key) => {
                medicineToUpdate[key] = updateMedicineDto[key];
            });
        }

        await medicineToUpdate.save();

        return medicineToUpdate.populate(populateQuery);
    }

    async updateActiveIngredientComponent(
        ingredientId: ObjectId,
        dto: UpdateActiveIngredientDto
    ): Promise<ActiveIngredientComponent> {
        const activeIngredientComponentToUpdate =
            await this.activeIngredientComponentModel.findOne({
                _id: ingredientId,
            });
        if (!activeIngredientComponentToUpdate)
            throw new NotFoundException("Active Ingredient Not Found.");

        Object.keys(dto).map((key) => {
            activeIngredientComponentToUpdate[key] = dto[key];
        });
        await activeIngredientComponentToUpdate.save();
        return activeIngredientComponentToUpdate.populate("activeIngredient");
    }

    async createActiveIngredientComponent(
        medicineId: ObjectId,
        dto: ActiveIngredientCreateDto,
        clinicId: ObjectId
    ): Promise<MedicineDocument> {
        const session = await this.medicineModel.startSession();
        session.startTransaction();
        try {
            const medicine = await this.medicineModel
                .findOne(
                    {
                        _id: medicineId,
                        clinic: clinicId,
                    },
                    null,
                    { session }
                )
                .populate(populateQuery)
                .exec();

            if (!medicine) throw new NotFoundException("Medicine Not Found.");

            if (
                medicine.activeIngredients.find(
                    (ingredient: any) =>
                        ingredient.activeIngredient._id.toString() ==
                        dto.activeIngredient.toString()
                )
            )
                throw new BadRequestException("Already Existing Ingredient.");
            const activeIngredientComponent =
                new this.activeIngredientComponentModel(dto);
            await activeIngredientComponent.save({ session });

            medicine.activeIngredients.push(activeIngredientComponent._id);
            await medicine.save({ session });
            await session.commitTransaction();
            session.endSession();
            return medicine.populate(populateQuery);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }
    async deleteMedicine(
        medicineId: ObjectId,
        clinicId: ObjectId
    ): Promise<object> {
        const session = await this.medicineModel.startSession();
        session.startTransaction();
        try {
            const medicine = await this.medicineModel.findOne(
                {
                    _id: medicineId,
                    clinic: clinicId,
                },
                null,
                { session }
            );
            if (!medicine) throw new NotFoundException("Medicine Not Found.");
            await this.activeIngredientComponentModel.deleteMany(
                {
                    _id: { $in: medicine.activeIngredients },
                },
                { session }
            );
            await this.medicineModel.findByIdAndDelete(medicineId, { session });
            await session.commitTransaction();
            session.endSession();
            return { deletedCount: 1 };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }

    async deleteActiveIngredientComponent(
        ingredientId: ObjectId,
        medicineId: ObjectId,
        clinicId: ObjectId
    ): Promise<MedicineDocument> {
        const session = await this.medicineModel.startSession();
        session.startTransaction();
        try {
            const medicine = await this.medicineModel.findOne(
                {
                    _id: medicineId,
                    clinic: clinicId,
                },
                null,
                { session }
            );
            if (!medicine) throw new NotFoundException("Medicine Not Found.");

            await this.activeIngredientComponentModel.deleteOne(
                {
                    _id: ingredientId,
                },
                { session }
            );
            medicine.activeIngredients = medicine.activeIngredients.filter(
                (id) => id.toString() !== ingredientId.toString()
            );
            await medicine.save({ session });
            await session.commitTransaction();
            session.endSession();
            return medicine.populate(populateQuery);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }
}
