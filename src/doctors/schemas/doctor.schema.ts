import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Gender } from "src/shared/shared.enum";
import { Speciality } from "./speciality.schema";

@Schema()
export class Doctor {
    @Prop()
    avatarUrl: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    dateOfBirth: Date;

    @Prop({ required: true, enum: Gender })
    gender: Gender;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Speciality.name })
    speciality: Speciality; // TODO

    @Prop({ required: true, unique: true })
    mobile: string;

    @Prop()
    email: string;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
export type DoctorDocument = HydratedDocument<Doctor>;
