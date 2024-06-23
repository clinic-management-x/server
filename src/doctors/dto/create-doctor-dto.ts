import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import mongoose from "mongoose";
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
    speciality: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsPhoneNumber()
    mobile: string;

    @IsEmail()
    @IsOptional()
    email?: string;
}
