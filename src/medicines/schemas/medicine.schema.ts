import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { BuySellUnits, RoutesOfAdministration } from "src/shared/shared.enum";
import { GenericDrug } from "./generic-drug.schema";
import { ActiveIngredientComponent } from "./active-ingredient.schema";
import { Clinic } from "src/clinics/schemas/clinic.schema";

@Schema()
export class Medicine {
    @Prop({ required: true })
    brandName: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: GenericDrug.name })
    genericDrug: Types.ObjectId;

    @Prop({
        type: [SchemaTypes.ObjectId],
        ref: ActiveIngredientComponent.name,
    })
    activeIngredients: Types.ObjectId[];

    @Prop({ required: true, enum: RoutesOfAdministration })
    routeOfAdministration: RoutesOfAdministration;

    @Prop({ default: 0 })
    stockQuantity: number;

    @Prop({ required: true, enum: BuySellUnits })
    stockQuantityUnit: string;

    @Prop({ required: true })
    minimumAlertQuantity: number;

    @Prop({ required: true, enum: BuySellUnits })
    minimumAlertQuantityUnit: string;

    @Prop()
    sellPrices: [{ unit: string; price: number }];

    @Prop()
    quantityRelations?: [
        {
            upperUnit: BuySellUnits;
            lowerUnit: BuySellUnits;
            quantityRelation: number;
        },
    ];

    @Prop()
    imageUrls: string[];

    @Prop({ type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinic: Clinic;
}

export const MedicineSchema = SchemaFactory.createForClass(Medicine);
export type MedicineDocument = HydratedDocument<Medicine>;
