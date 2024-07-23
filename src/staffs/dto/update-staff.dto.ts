import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    ValidateIf,
} from "class-validator";
import { Gender } from "src/shared/shared.enum";

export class UpdateStaffDto {
    @IsOptional()
    @IsUrl()
    @ValidateIf((e) => e === "")
    avatarUrl?: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsDateString()
    @IsOptional()
    dateOfBirth?: Date;

    @IsOptional()
    @IsEnum(Gender)
    gender: string;

    @IsPhoneNumber()
    @IsOptional()
    mobile?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    address?: string;
}
