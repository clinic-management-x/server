import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";
import { User } from "src/users/schemas/user.schema";

@Schema({})
export class Clinic {
    @Prop()
    name: string;

    @Prop({
        type: SchemaTypes.ObjectId,
        required: true,
        unique: true,
        ref: User.name,
    })
    user: Types.ObjectId;

    // TODO
}

export const ClinicSchema = SchemaFactory.createForClass(Clinic);
export type ClinicDocument = HydratedDocument<Clinic>;
