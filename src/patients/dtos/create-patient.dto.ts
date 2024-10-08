import {
    IsArray,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { Gender } from "src/shared/shared.enum";

export class CreatePatientDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsDateString()
    @IsNotEmpty()
    dateOfBirth: Date;

    @IsNotEmpty()
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

    @IsNotEmpty()
    @IsArray()
    contacts: { name: string; value: string; is_preferred_way: boolean }[];

    @IsOptional()
    @IsString()
    occupation?: string;

    @IsNotEmpty()
    @IsString()
    //@IsPhoneNumber()
    emergencyMobileContact: string;

    @IsOptional()
    @IsString()
    @IsObjectId({ message: "Not a valid object id" })
    preferredDoctor?: string;
}
