import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { RoutesOfAdministration } from "src/shared/shared.enum";
import { BatchQrData } from "./qr.schema";

@Schema()
export class Medicine {
    @Prop({ required: true })
    brandName: string;

    @Prop()
    genericName: string;

    @Prop()
    activeIngridients: [{ name: string; strength: number; unit: string }];

    @Prop({ required: true, enum: RoutesOfAdministration })
    routeOfAdministration: RoutesOfAdministration;

    @Prop({ default: 0 })
    stockQuantiy: number;

    @Prop()
    miniumAlertQuantity: number;

    @Prop()
    sellPrices: [{ unit: string; price: number }];

    @Prop()
    imageUrls: string[];

    @Prop({
        required: true,
        type: [SchemaTypes.ObjectId],
        ref: BatchQrData.name,
    })
    batchQrData: Types.ObjectId[];
}

export const MedicineSchema = SchemaFactory.createForClass(Medicine);
export type MedicineDocument = HydratedDocument<Medicine>;
