import { Prop, Schema } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";
import { Order } from "src/orders/schemas/order.schema";

@Schema()
export class BatchQrData {
    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: Order.name })
    batchId: Types.ObjectId;

    @Prop({ required: true })
    qrcodes: number[];

    @Prop()
    quantityByExpiryDate: [{ expiryDate: Date; qty: number }];
}
