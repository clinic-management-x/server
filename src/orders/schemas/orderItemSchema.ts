import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";

import { BuySellUnits } from "src/shared/shared.enum";

@Schema()
export class OrderItem {
    @Prop({ type: SchemaTypes.ObjectId, ref: "Medicine" })
    itemName: Types.ObjectId;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true, enum: BuySellUnits })
    unit: BuySellUnits;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
export type OrderItemDocument = HydratedDocument<OrderItem>;
