import {
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import {
    BuySellUnits,
    RoutesOfAdministration,
    UnitsOfMeasurements,
} from "src/shared/shared.enum";

export class UpdateMedicineDto {
    @IsOptional()
    @IsString()
    brandName?: string;

    @IsOptional()
    @IsObjectId()
    @IsString()
    genericName?: string;

    @IsOptional()
    @IsString()
    @IsEnum(RoutesOfAdministration)
    routeOfAdministration?: string;

    @IsOptional()
    @IsNumber()
    stockQuantity?: number;

    @IsOptional()
    @IsEnum(BuySellUnits)
    stockQuantityUnit?: string;

    @IsOptional()
    @IsNumber()
    minimumAlertQuantity?: number;

    @IsOptional()
    @IsEnum(BuySellUnits)
    minimumAlertQuantityUnit?: string;

    @IsOptional()
    @IsArray()
    sellPrices?: [{ unit: string; price: number }];

    @IsOptional()
    @IsArray()
    quantityRelations?: [
        { lowerUnit: string; upperUnit: string; quantityRelation: number },
    ];

    @IsOptional()
    @IsArray()
    imageUrls?: { actual: string; preview: string }[];
}

export class UpdateActiveIngredientDto {
    @IsOptional()
    @IsNumber()
    strength?: number;

    @IsOptional()
    @IsEnum(UnitsOfMeasurements)
    @IsString()
    unit?: string;
}
