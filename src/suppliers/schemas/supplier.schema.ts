import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema()
export class Supplier {
    @Prop()
    name: string;

    @Prop()
    address?: string;

    @Prop()
    mobile: string;

    @Prop()
    email?: string;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
export type SupplierDocument = HydratedDocument<Supplier>;
