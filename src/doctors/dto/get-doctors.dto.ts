import { Type } from "class-transformer";
import {
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class GetDoctorsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Max(10)
    @Min(0)
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
    @IsObjectId({
        message: "not a valid object ID",
    })
    speciality?: string;
}
