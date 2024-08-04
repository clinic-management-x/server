import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Clinic } from "src/clinics/schemas/clinic.schema";

@Schema()
export class Supplier {
    @Prop({ required: true })
    name: string;

    @Prop()
    avatar?: string;

    @Prop()
    address?: string;

    @Prop({ required: true, unique: true })
    mobile: string;

    @Prop({ unique: true })
    email?: string;

    @Prop()
    contacts?: [{ name: string; value: string }];

    @Prop({ type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinic: Clinic;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
export type SupplierDocument = HydratedDocument<Supplier>;
