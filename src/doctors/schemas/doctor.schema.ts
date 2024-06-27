import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { Gender } from "src/shared/shared.enum";
import { Speciality } from "./speciality.schema";
import { Clinic } from "src/clinics/schemas/clinic.schema";

@Schema()
export class Doctor {
    @Prop()
    avatarUrl?: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    dateOfBirth?: Date;

    @Prop({ required: true, enum: Gender })
    gender: Gender;

    @Prop({ type: SchemaTypes.ObjectId, ref: Speciality.name })
    speciality: Speciality;

    @Prop({ required: true, unique: true })
    mobile: string;

    @Prop()
    email?: string;

    @Prop({ required: true })
    doctorFee: number; // ?Per consultation

    @Prop({ type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinic: Types.ObjectId;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
export type DoctorDocument = HydratedDocument<Doctor>;
