import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Medicine } from "./schemas/medicine.schema";
import { Model } from "mongoose";
import { GenericDrug } from "./schemas/generic-drug.schema";

@Injectable()
export class MedicinesService {
    constructor(
        @InjectModel(Medicine.name) private medicineModel: Model<Medicine>,
        @InjectModel(GenericDrug.name)
        private genericDrugModel: Model<GenericDrug>
    ) {}

    async getAllGenericDrugs() {
        const filter = {};
        const [data, count] = await Promise.all([
            this.genericDrugModel.find(filter).skip(0).limit(10).exec(),
            this.genericDrugModel.find(filter).countDocuments(),
        ]);

        return { data, count };
    }
}
