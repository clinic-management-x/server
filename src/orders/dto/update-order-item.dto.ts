import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { BuySellUnits } from "src/shared/shared.enum";

export class UpdateOrderItemDto {
    @IsNotEmpty()
    @IsObjectId()
    @IsString()
    itemId: string;

    @IsOptional()
    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    @IsEnum(BuySellUnits)
    unit: string;
}
