import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { OrderStatus, PaymentMethods } from "src/shared/shared.enum";
import { OrderItemDto } from "./create-order.dto";

export class UpdateOrderDto {
    @IsOptional()
    @IsString()
    batchId?: string;

    @IsOptional()
    @IsEnum(PaymentMethods)
    paymentMethod?: string;

    @IsOptional()
    @IsDateString()
    estimateDate?: Date;

    @IsOptional()
    @IsString()
    @IsObjectId({ message: "Not a valid object id" })
    supplier?: string;

    @IsOptional()
    @IsArray()
    orderItems?: OrderItemDto[];

    @IsOptional()
    @IsString()
    @IsEnum(OrderStatus)
    orderStatus?: string;

    @IsOptional()
    @IsBoolean()
    hasAlreadyArrived?: boolean;
}
