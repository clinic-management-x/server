import {
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { RoutesOfAdministration } from "src/shared/shared.enum";

export class UpdateMedicineDto {
    @IsOptional()
    @IsString()
    brandName?: string;

    @IsOptional()
    @IsString()
    genericName?: string;

    @IsOptional()
    @IsArray()
    activeIngridients?: [{ name: string; strength: number; unit: string }];

    @IsOptional()
    @IsString()
    @IsEnum(RoutesOfAdministration)
    routeOfAdministration?: string;

    @IsOptional()
    @IsNumber()
    stockQuantiy?: number;

    @IsOptional()
    @IsNumber()
    miniumAlertQuantity?: number;

    @IsOptional()
    @IsArray()
    sellPrices?: [{ unit: string; price: number }];

    @IsOptional()
    @IsArray()
    imageUrls?: string[];
}
