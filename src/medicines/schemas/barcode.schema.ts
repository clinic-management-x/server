import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { Order } from "src/orders/schemas/order.schema";
import { Medicine } from "./medicine.schema";
import { BuySellUnits } from "src/shared/shared.enum";
import { Clinic } from "src/clinics/schemas/clinic.schema";

@Schema({
    collection: "bar_codes",
})
export class BarCode {
    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: Medicine.name })
    medicine: Types.ObjectId;

    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: Order.name })
    batchId: Types.ObjectId;

    @Prop({ required: true })
    barCodeNumber: string;

    @Prop()
    barCodeUrl?: string;

    @Prop()
    expiredDate: Date;

    @Prop()
    quantity: number;

    @Prop({ required: true, enum: BuySellUnits })
    unit: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinic: Clinic;
}

@Schema({
    collection: "scan_history",
})
export class ScanHistory {
    @Prop({
        required: true,
        type: SchemaTypes.ObjectId,
        ref: BarCode.name,
    })
    qrId: Types.ObjectId;

    @Prop()
    quantity: number;

    @Prop({ required: true, enum: BuySellUnits })
    unit: string;
}

export const BarCodeSchema = SchemaFactory.createForClass(BarCode);
export const ScanHistorySchema = SchemaFactory.createForClass(ScanHistory);
export type BarCodeDocument = HydratedDocument<BarCode>;
export type ScanHistoryDocument = HydratedDocument<ScanHistory>;
