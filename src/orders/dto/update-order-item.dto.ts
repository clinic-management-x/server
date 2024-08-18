import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { BuySellUnits } from "src/shared/shared.enum";

export class UpdateOrderItemDto {
    @IsOptional()
    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    @IsEnum(BuySellUnits)
    unit: string;
}
