import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    Min,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { Gender } from "src/shared/shared.enum";

export class CreateDoctorDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsDateString()
    @IsOptional()
    dateOfBirth?: Date;

    @IsNotEmpty()
    @IsEnum(Gender)
    gender: Gender;

    @IsNotEmpty()
    @IsString()
    @IsObjectId({
        message: "not a valid object ID",
    })
    speciality: string;

    @IsNotEmpty()
    @IsPhoneNumber()
    mobile: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    doctorFee: number;

    @IsOptional()
    @IsUrl({})
    avatarUrl?: string;
}
