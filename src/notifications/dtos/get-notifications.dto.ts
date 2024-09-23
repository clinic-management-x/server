import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { NotificationType } from "src/shared/shared.enum";

export class GetNotificationsDto {
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
    @IsEnum(NotificationType)
    @IsString()
    type?: string;
}
