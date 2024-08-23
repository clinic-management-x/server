import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";

@Schema({
    collection: "active_ingredients",
})
export class ActiveIngredient {
    @Prop()
    activeIngredientName: string;
}

export const ActiveIngredientSchema =
    SchemaFactory.createForClass(ActiveIngredient);
export type ActiveIngredientDocument = HydratedDocument<ActiveIngredient>;

@Schema({
    collection: "active_ingredient_components",
})
export class ActiveIngredientComponent {
    @Prop({ type: SchemaTypes.ObjectId, ref: ActiveIngredient.name })
    activeIngredient: Types.ObjectId;

    @Prop()
    strength: number;

    @Prop()
    unit: string;
}

export const ActiveIngredientComponentSchema = SchemaFactory.createForClass(
    ActiveIngredientComponent
);
export type ActiveIngredientComponentDocument =
    HydratedDocument<ActiveIngredientComponent>;
