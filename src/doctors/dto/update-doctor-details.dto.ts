import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    Min,
    ValidateIf,
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

    @IsNumber()
    @IsOptional()
    @Min(0)
    doctorFee?: number;

    @IsOptional()
    @IsString()
    @ValidateIf((e) => e === "")
    @IsUrl({})
    avatarUrl?: string;
}
