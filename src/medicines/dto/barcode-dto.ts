import {
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { BuySellUnits } from "src/shared/shared.enum";

export class CreateBarcodeDto {
    @IsNotEmpty()
    @IsObjectId({ message: "Not a valid object id" })
    @IsString()
    medicine: string;

    @IsNotEmpty()
    @IsObjectId({ message: "Not a valid object id" })
    @IsString()
    orderId: string;

    @IsNotEmpty()
    @IsString()
    batchId: string;

    @IsOptional()
    @IsString()
    barcode?: string;

    @IsOptional()
    @IsUrl()
    barCodeUrl?: string;

    @IsNotEmpty()
    @IsDateString()
    expiredDate: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsEnum(BuySellUnits)
    @IsString()
    unit: string;
}

export class ScanDto {
    @IsNotEmpty()
    @IsObjectId({ message: "Not a valid object id" })
    @IsString()
    barcodeId: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsEnum(BuySellUnits)
    @IsString()
    unit: string;
}
