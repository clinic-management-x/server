import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Clinic } from "src/clinics/schemas/clinic.schema";

@Schema({
    collection: "medical_representatives",
})
export class MedicalRepresentative {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    mobile: string;

    @Prop({ unique: true })
    email?: string;

    @Prop()
    contacts?: [{ name: string; data: string }];

    // @Prop({ type: SchemaTypes.ObjectId, ref: Supplier.name })
    // supplierCompany: Supplier;

    @Prop({ type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinic: Clinic;
}

export const MedicalRepresentativeSchema = SchemaFactory.createForClass(
    MedicalRepresentative
);
export type MedicalRepresentativeDocument =
    HydratedDocument<MedicalRepresentative>;
