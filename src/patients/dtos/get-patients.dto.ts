import { Type } from "class-transformer";
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class GetPatientsDto {
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

export class GetPatientDto {
    @IsNotEmpty()
    @IsObjectId()
    @IsString()
    _id: string;
}
