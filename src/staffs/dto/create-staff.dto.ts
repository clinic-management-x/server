import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
} from "class-validator";
import { Gender } from "src/shared/shared.enum";

export class CreateStaffDto {
    @IsOptional()
    @IsUrl()
    avatarUrl?: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    @IsOptional()
    dateOfBirth?: Date;

    @IsNotEmpty()
    @IsEnum(Gender)
    gender: string;

    @IsPhoneNumber()
    @IsNotEmpty()
    mobile: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    address?: string;
}
