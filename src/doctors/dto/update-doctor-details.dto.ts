import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { Gender } from "src/shared/shared.enum";

export class UpdateDoctorDetailsDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsDateString()
    @IsOptional()
    dateOfBirth?: Date;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsString()
    @IsObjectId({
        message: "not a valid object ID",
    })
    speciality?: string;

    @IsOptional()
    @IsPhoneNumber()
    mobile?: string;

    @IsEmail()
    @IsOptional()
    email?: string;
}
