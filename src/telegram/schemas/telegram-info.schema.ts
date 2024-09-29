import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { Clinic } from "src/clinics/schemas/clinic.schema";
import { Supplier } from "src/suppliers/schemas/supplier.schema";

@Schema({
    collection: "telegram_group_info",
})
export class TelegramGroupInfo {
    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: Supplier.name })
    supplierId: Types.ObjectId;

    @Prop({ required: true })
    groupId: number;

    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinicId: Types.ObjectId;
}

export const TelegramInfoSchema =
    SchemaFactory.createForClass(TelegramGroupInfo);
export type TelegramInfoDocument = HydratedDocument<TelegramGroupInfo>;
