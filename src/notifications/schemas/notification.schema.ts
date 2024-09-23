import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes } from "mongoose";
import { Clinic } from "src/clinics/schemas/clinic.schema";
import { NotificationType } from "src/shared/shared.enum";

@Schema({ timestamps: true })
export class Notification {
    @Prop({ required: true, enum: NotificationType })
    type: NotificationType;

    @Prop({ required: true })
    message: string;

    @Prop({ required: true, default: false })
    hasRead: boolean;

    @Prop({ type: SchemaTypes.ObjectId, ref: Clinic.name })
    clinicId: Clinic;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
export type NotificationDocument = HydratedDocument<Notification>;
