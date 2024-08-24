import {
    BadRequestException,
    Injectable,
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
    ActiveIngredientDto,
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
            path: "activeIngredient", // Replace '_id' with the actual reference field in ActiveIngredient
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
                    medicine.imageUrls = await this.genereatePresignedUrls(
                        medicine.imageUrls
                    );
                }
            })
        );

        return {
            data,
            count,
        };
    }

    async getMedicinesList(clinicId: ObjectId): Promise<object> {
        const suppliers = await this.medicineModel
            .find({ clinic: clinicId }, { _id: 1, brandName: 1 })
            .exec();
        return suppliers;
    }

    async getMedicine(
        _id: ObjectId,
        clinicId: ObjectId
    ): Promise<MedicineDocument> {
        const medicine = await this.medicineModel
            .findOne({ _id: _id, clinic: clinicId })
            .populate(populateQuery)
            .exec();
        if (!medicine) throw new NotFoundException("Medicine Not Found.");
        if (medicine.imageUrls) {
            medicine.imageUrls = await this.genereatePresignedUrls(
                medicine.imageUrls
            );
        }
        return medicine;
    }

    async genereatePresignedUrls(urls: string[]): Promise<string[]> {
        const presignedUrls = urls.map((image) =>
            this.filesService.createPresignedUrl(image)
        );
        return await Promise.all(presignedUrls);
    }

    async createMedicine(
        createMedicineDto: CreateMedicineDto,
        clinicId: ObjectId
    ): Promise<MedicineDocument> {
        const activeIngredients =
            await this.activeIngredientComponentModel.insertMany(
                createMedicineDto.activeIngredients
            );

        const data = {
            ...createMedicineDto,
            activeIngredients: activeIngredients.map(
                (ingridient) => ingridient._id
            ),
            clinic: clinicId,
        };
        const medicine = await this.medicineModel.create(data);

        return medicine.populate(populateQuery);
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

        //TO-DO
        //fix for url array
        // const s3AvatarUrls = updateMedicineDto.imageUrls;
        // if (s3AvatarUrls.length) {
        //     await this.filesService.checkFilesByUrls(s3AvatarUrls, clinicId);
        // }

        Object.keys(updateMedicineDto).map((key) => {
            medicineToUpdate[key] = updateMedicineDto[key];
        });

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
        dto: ActiveIngredientDto,
        clinicId: ObjectId
    ): Promise<MedicineDocument> {
        const medicine = await this.medicineModel
            .findOne({
                _id: medicineId,
                clinic: clinicId,
            })
            .populate(populateQuery);
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
            await this.activeIngredientComponentModel.create(dto);

        medicine.activeIngredients.push(activeIngredientComponent._id);
        await medicine.save();

        return medicine.populate(populateQuery);
    }
    async deleteMedicine(
        medicineId: ObjectId,
        clinicId: ObjectId
    ): Promise<object> {
        const medicine = await this.medicineModel.findOne({
            _id: medicineId,
            clinic: clinicId,
        });
        if (!medicine) throw new NotFoundException("Medicine Not Found.");
        await this.activeIngredientComponentModel.deleteMany({
            _id: { $in: medicine.activeIngredients },
        });
        await medicine.deleteOne({ _id: medicineId });
        return { deletedCount: 1 };
    }

    async deleteActiveIngredientComponent(
        ingredientId: ObjectId,
        medicineId: ObjectId,
        clinicId: ObjectId
    ): Promise<MedicineDocument> {
        const medicine = await this.medicineModel.findOne({
            _id: medicineId,
            clinic: clinicId,
        });
        if (!medicine) throw new NotFoundException("Medicine Not Found.");

        await this.activeIngredientComponentModel.deleteOne({
            _id: ingredientId,
        });
        medicine.activeIngredients = medicine.activeIngredients.filter(
            (id) => id.toString() !== ingredientId.toString()
        );
        await medicine.save();
        return medicine.populate(populateQuery);
    }
}
