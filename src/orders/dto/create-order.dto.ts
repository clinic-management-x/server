import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import {
    BuySellUnits,
    OrderStatus,
    PaymentMethods,
} from "src/shared/shared.enum";

export class OrderItemDto {
    @IsNotEmpty()
    @IsString()
    itemName: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsEnum(BuySellUnits)
    unit: string;
}

export class CreateOrderDto {
    @IsOptional()
    @IsString()
    batchId: string;

    @IsNotEmpty()
    @IsEnum(PaymentMethods)
    paymentMethod: string;

    @IsOptional()
    @IsDateString()
    estimateDate: Date;

    @IsNotEmpty()
    @IsString()
    @IsObjectId({ message: "Not a valid object id" })
    supplierId: string;

    @IsNotEmpty()
    @IsArray()
    orderItems: OrderItemDto[];

    @IsNotEmpty()
    @IsString()
    @IsEnum(OrderStatus)
    orderStatus: string;

    @IsNotEmpty()
    @IsBoolean()
    hasAlreadyArrived: boolean;
}
