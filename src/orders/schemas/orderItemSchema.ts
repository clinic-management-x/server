import { Prop, Schema } from "@nestjs/mongoose";
import { BuySellUnits } from "src/shared/shared.enum";

@Schema()
export class OrderItem {
    @Prop({ required: true })
    itemName: string;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true, enum: BuySellUnits })
    unit: BuySellUnits;
}
