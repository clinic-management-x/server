import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Doctor } from "./doctor.schema";
import { Clinic } from "src/clinics/schemas/clinic.schema";

@Schema()
export class Schedule {
    @Prop({ max: 6, min: 0 })
    startDay: number;

    @Prop({ max: 2400, min: 0 })
    startTime: number;

    @Prop({ max: 6, min: 0 })
    endDay: number;

    @Prop({ max: 2400, min: 0 })
    endTime: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Schedule.name })
    doctor: Doctor;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Clinic.name })
    clinic: Clinic;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
export type ScheduleDocument = HydratedDocument<Schedule>;
