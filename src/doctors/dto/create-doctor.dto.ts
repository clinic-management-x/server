import { Type } from "class-transformer";
import {
    IsArray,
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
    MinLength,
    ValidateNested,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { Gender } from "src/shared/shared.enum";
import { ScheduleDto } from "./create-schedule.dto";

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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScheduleDto)
    @IsOptional()
    schedules: Array<ScheduleDto> = [];
}
