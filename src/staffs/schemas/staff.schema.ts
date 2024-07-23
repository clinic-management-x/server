import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Gender } from "src/shared/shared.enum";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { Clinic } from "src/clinics/schemas/clinic.schema";

@Schema()
export class Staff {
    @Prop()
    avatarUrl?: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    dateOfBirth?: Date;

    @Prop({ required: true, enum: Gender })
    gender: string;

    @Prop({ required: true, unique: true })
    mobile: string;

    @Prop()
    email?: string;

    @Prop()
    address?: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinic: Types.ObjectId;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
export type StaffDocument = HydratedDocument<Staff>;
