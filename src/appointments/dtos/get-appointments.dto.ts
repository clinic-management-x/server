import { Type } from "class-transformer";
import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from "class-validator";

export class GetAppointmentsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10)
    limit?: number = 10;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    skip?: number = 0;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    search?: string;

    @IsOptional()
    @IsString()
    nearest?: string;

    @IsOptional()
    @IsString()
    necessity?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsDateString()
    start?: string;

    @IsOptional()
    @IsDateString()
    end?: string;
}

export class GetAppointmentsByDateDto {
    @IsNotEmpty()
    @IsDateString()
    date: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10)
    limit?: number = 10;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    skip?: number = 0;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    search?: string;
}
