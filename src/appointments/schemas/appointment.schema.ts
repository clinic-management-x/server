import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Clinic } from "src/clinics/schemas/clinic.schema";
import { Doctor } from "src/doctors/schemas/doctor.schema";
import { Patient } from "src/patients/schemas/patient.schema";
import { AppointmentStatus, Necessity } from "src/shared/shared.enum";

@Schema({ timestamps: true })
export class Appointment {
    @Prop({ type: SchemaTypes.ObjectId, ref: Patient.name })
    patient: Patient;

    @Prop({ type: SchemaTypes.ObjectId, ref: Doctor.name })
    doctor: Doctor;

    @Prop({ required: true })
    appointmentDate: Date;

    @Prop({ required: true })
    appointmentStartTime: Date;

    @Prop({ required: true })
    appointmentEndTime: Date;

    @Prop({ required: true, enum: Necessity })
    necessity: Necessity;

    @Prop({
        required: true,
        enum: AppointmentStatus,
        default: AppointmentStatus.PENDING,
    })
    status: AppointmentStatus;

    @Prop({ type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinicId: Clinic;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
export type AppointmentDocument = HydratedDocument<Appointment>;
