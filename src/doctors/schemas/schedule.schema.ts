import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { Doctor } from "./doctor.schema";
import { Clinic } from "src/clinics/schemas/clinic.schema";

@Schema()
export class Schedule {
    @Prop({ required: true, max: 10080, min: 0 })
    start: number;

    @Prop({ required: true, max: 10080, min: 0 })
    end: number;

    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinic: Types.ObjectId;

    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: Doctor.name })
    doctor: Types.ObjectId;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
export type ScheduleDocument = HydratedDocument<Schedule>;
