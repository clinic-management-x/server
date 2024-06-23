import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema()
export class Speciality {
    @Prop()
    name: string;
}

export const SpecialitySchema = SchemaFactory.createForClass(Speciality);
export type SpecialityDocument = HydratedDocument<Speciality>;
