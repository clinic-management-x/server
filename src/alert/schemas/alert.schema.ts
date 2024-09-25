import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Clinic } from "src/clinics/schemas/clinic.schema";
import { AlertType } from "src/shared/shared.enum";

@Schema({ timestamps: true })
export class Alert {
    @Prop({ required: true, enum: AlertType })
    type: AlertType;

    @Prop({ required: true, default: false })
    enable: boolean;

    @Prop({ required: true, default: 0 })
    days: number;

    @Prop({ type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinicId: Clinic;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
export type AlertDocument = HydratedDocument<Alert>;
