import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
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
    @IsObjectId({ message: "Not a valid object id" })
    @IsString()
    itemName: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsEnum(BuySellUnits)
    unit: string;
}

class ItemNameDto {
    @IsNotEmpty()
    @IsObjectId({ message: "Not a valid object id" })
    @IsString()
    _id: string;

    @IsNotEmpty()
    @IsString()
    brandName: string;
}
export class OrderItemMainDto {
    @IsNotEmpty()
    @IsObject()
    itemName: ItemNameDto;
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
    supplier: string;

    @IsNotEmpty()
    @IsArray()
    orderItems: OrderItemMainDto[];

    @IsNotEmpty()
    @IsString()
    @IsEnum(OrderStatus)
    orderStatus: string;

    @IsNotEmpty()
    @IsBoolean()
    hasAlreadyArrived: boolean;
}
