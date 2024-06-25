import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { Clinic } from "src/clinics/schemas/clinic.schema";
import { FilePurpose } from "src/shared/shared.enum";

@Schema()
export class File {
    @Prop({ required: true, enum: FilePurpose })
    purpose: FilePurpose;

    @Prop({ required: true, unique: true })
    url: string;

    @Prop({
        required: true,
        type: SchemaTypes.ObjectId,
        ref: Clinic.name,
    })
    clinic: Types.ObjectId;
}

export const FileSchema = SchemaFactory.createForClass(File);
export type FileDocument = HydratedDocument<File>;
