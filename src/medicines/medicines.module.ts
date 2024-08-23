import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
    ActiveIngredient,
    ActiveIngredientComponent,
    ActiveIngredientComponentSchema,
    ActiveIngredientSchema,
} from "./schemas/active-ingredient.schema";
import { GenericDrug, GenericDrugSchema } from "./schemas/generic-drug.schema";
import { Medicine, MedicineSchema } from "./schemas/medicine.schema";
import { MedicinesController } from "./medicines.controller";
import { MedicinesService } from "./medicines.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ActiveIngredient.name, schema: ActiveIngredientSchema },
            {
                name: ActiveIngredientComponent.name,
                schema: ActiveIngredientComponentSchema,
            },
            { name: GenericDrug.name, schema: GenericDrugSchema },
            { name: Medicine.name, schema: MedicineSchema },
        ]),
    ],
    controllers: [MedicinesController],
    providers: [MedicinesService],
})
export class MedicinesModule {}
