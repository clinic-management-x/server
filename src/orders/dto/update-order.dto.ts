import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "src/shared/shared.enum";

export class UpdateOrderDto {
    @IsOptional()
    @IsString()
    batchId: string;

    @IsOptional()
    @IsString()
    @IsEnum(OrderStatus)
    orderStatus: string;
}
