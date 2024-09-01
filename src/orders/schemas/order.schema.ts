import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { OrderStatus, PaymentMethods } from "src/shared/shared.enum";
import { OrderItem } from "./orderItemSchema";
import { Supplier } from "src/suppliers/schemas/supplier.schema";
import { Clinic } from "src/clinics/schemas/clinic.schema";

@Schema()
export class Order {
    @Prop({ required: true })
    batchId: string;

    @Prop({ required: true, enum: PaymentMethods })
    paymentMethod: PaymentMethods;

    @Prop({ type: Date })
    estimateDate?: Date;

    @Prop({ type: SchemaTypes.ObjectId, ref: Supplier.name })
    supplier: Types.ObjectId;

    @Prop({ type: [SchemaTypes.ObjectId], ref: OrderItem.name })
    orderItems: Types.ObjectId[];

    @Prop({ enum: OrderStatus, default: OrderStatus.PENDING })
    orderStatus: OrderStatus;

    @Prop({ default: false })
    hasAlreadyArrived: boolean;

    @Prop({ type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinic: Clinic;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
export type OrderDocument = HydratedDocument<Order>;
