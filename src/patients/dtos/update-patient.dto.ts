import {
    IsArray,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { Gender } from "src/shared/shared.enum";

export class UpdatePatientDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsDateString()
    @IsOptional()
    dateOfBirth?: Date;

    @IsOptional()
    @IsEnum(Gender)
    @IsString()
    gender: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    postalCode?: string;

    @IsOptional()
    @IsArray()
    contacts?: { name: string; value: string; is_preferred_way: boolean }[];

    @IsOptional()
    @IsString()
    occupation?: string;

    @IsOptional()
    @IsString()
    emergencyMobileContact?: string;

    @IsOptional()
    @IsString()
    @IsObjectId({ message: "Not a valid object id" })
    preferredDoctor?: string;
}
