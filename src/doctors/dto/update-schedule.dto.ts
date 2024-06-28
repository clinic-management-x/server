import { IsNumber, IsOptional, Min } from "class-validator";

export class UpdateScheduleDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    startDay: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    startTime: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    endDay: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    endTime: number;
}
