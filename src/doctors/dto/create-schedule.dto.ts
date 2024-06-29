import { Type } from "class-transformer";
import {
    ArrayNotEmpty,
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsString,
    Min,
    ValidateNested,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class ScheduleDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    startDay: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    startTime: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    endDay: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    endTime: number;
}

export class CreateScheduleDto {
    @ArrayNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScheduleDto)
    schedules: Array<ScheduleDto>;

    @IsNotEmpty()
    @IsString()
    @IsObjectId({
        message: "not a valid object ID",
    })
    doctor: string;
}
