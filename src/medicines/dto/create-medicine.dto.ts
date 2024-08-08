import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { RoutesOfAdministration } from "src/shared/shared.enum";

export class QrDto {
    @IsNotEmpty()
    @IsString()
    @IsObjectId({ message: "Not a valid object id" })
    batchId: string;

    @IsNotEmpty()
    @IsArray()
    qrcodes: number[];

    @IsNotEmpty()
    @IsArray()
    quantityByExpiryDate: [{ expiryDate: Date; qty: number }];
}

export class CreateMedicineDto {
    @IsNotEmpty()
    @IsString()
    brandName: string;

    @IsNotEmpty()
    @IsString()
    genericName: string;

    @IsNotEmpty()
    @IsArray()
    activeIngridients: [{ name: string; strength: number; unit: string }];

    @IsNotEmpty()
    @IsString()
    @IsEnum(RoutesOfAdministration)
    routeOfAdministration: string;

    @IsNotEmpty()
    @IsNumber()
    stockQuantiy: number;

    @IsNotEmpty()
    @IsNumber()
    miniumAlertQuantity: number;

    @IsNotEmpty()
    @IsArray()
    sellPrices: [{ unit: string; price: number }];

    @IsNotEmpty()
    @IsArray()
    imageUrls: string[];

    @IsNotEmpty()
    batchQrData: QrDto[];
}
