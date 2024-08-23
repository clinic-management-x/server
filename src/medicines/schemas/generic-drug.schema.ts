import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
    collection: "generic_drugs",
})
export class GenericDrug {
    @Prop()
    genericName: string;
}

export const GenericDrugSchema = SchemaFactory.createForClass(GenericDrug);
export type GenericDrugDocument = HydratedDocument<GenericDrug>;
