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
import { FilesModule } from "src/files/files.module";
import { BarCodeService } from "./barcode.service";
import {
    BarCode,
    BarCodeSchema,
    ScanHistory,
    ScanHistorySchema,
} from "./schemas/barcode.schema";
import { Order, OrderSchema } from "src/orders/schemas/order.schema";

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
            { name: BarCode.name, schema: BarCodeSchema },
            { name: Order.name, schema: OrderSchema },
            { name: ScanHistory.name, schema: ScanHistorySchema },
        ]),
        FilesModule,
    ],
    controllers: [MedicinesController],
    providers: [MedicinesService, BarCodeService],
})
export class MedicinesModule {}
