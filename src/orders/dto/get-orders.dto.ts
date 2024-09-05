import { Type } from "class-transformer";
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class GetBatchIdDto {
    @IsNotEmpty()
    @IsString()
    batchId?: string;

    @IsOptional()
    @IsBoolean()
    isEdit?: boolean;

    @IsOptional()
    @IsString()
    @IsObjectId()
    _id?: string;
}
export class GetOrdersDto {
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
