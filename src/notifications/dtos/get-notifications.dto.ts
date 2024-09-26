import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class GetNotificationsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    limit?: number = 10;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    skip?: number = 0;

    @IsOptional()
    @IsString()
    type?: string;
}
