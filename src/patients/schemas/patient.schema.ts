import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";

import { Clinic } from "src/clinics/schemas/clinic.schema";
import { Doctor } from "src/doctors/schemas/doctor.schema";
import { Gender } from "src/shared/shared.enum";

interface Contacts {
    name: string;
    value: string;
    is_preferred_way: boolean;
}

@Schema({ timestamps: true })
export class Patient {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    patientId: string;

    @Prop({ required: false })
    qrCodeUrl: string;

    @Prop({ required: true })
    dateOfBirth: Date;

    @Prop({ required: true, enum: Gender })
    gender: Gender;

    @Prop({ required: false, default: "" })
    address?: string;

    @Prop({ required: false })
    city?: string;

    @Prop({ required: false })
    state?: string;

    @Prop({ required: false })
    country?: string;

    @Prop({ required: false })
    postalCode?: string;

    @Prop()
    contacts: Contacts[];

    @Prop()
    occupation: string;

    @Prop({ isRequired: true })
    emergencyMobileContact: string;

    @Prop({
        isRequired: false,
        type: SchemaTypes.ObjectId,
        ref: Doctor.name,
        default: null,
    })
    preferredDoctor?: Doctor;

    @Prop({ type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinic: Clinic;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
export type PatientDocument = HydratedDocument<Patient>;
