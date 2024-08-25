import { Optional } from "@nestjs/common";
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import {
    BuySellUnits,
    RoutesOfAdministration,
    UnitsOfMeasurements,
} from "src/shared/shared.enum";

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

export class ActiveIngredientDto {
    @IsNotEmpty()
    @IsObjectId({ message: "Not a valid object id" })
    @IsString()
    activeIngredient: string;

    @IsNotEmpty()
    @IsNumber()
    strength: number;

    @IsNotEmpty()
    @IsEnum(UnitsOfMeasurements)
    @IsString()
    unit: string;
}

export class CreateMedicineDto {
    @IsNotEmpty()
    @IsString()
    brandName: string;

    @IsNotEmpty()
    @IsObjectId({ message: "Not a valid object id" })
    @IsString()
    genericDrug: string;

    @IsNotEmpty()
    @IsArray()
    activeIngredients: ActiveIngredientDto[];

    @IsNotEmpty()
    @IsString()
    @IsEnum(RoutesOfAdministration)
    routeOfAdministration: string;

    @IsNotEmpty()
    @IsNumber()
    stockQuantity: number;

    @IsNotEmpty()
    @IsEnum(BuySellUnits)
    stockQuantityUnit: string;

    @IsNotEmpty()
    @IsNumber()
    miniumAlertQuantity: number;

    @IsNotEmpty()
    @IsEnum(BuySellUnits)
    minimumAlertQuantityUnit: string;

    @IsNotEmpty()
    @IsArray()
    sellPrices: [{ unit: string; price: number }];

    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    imageUrls: string[];

    @Optional()
    batchQrData: QrDto[];
}
