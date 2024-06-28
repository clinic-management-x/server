import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class CreateScheduleDto {
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

    @IsNotEmpty()
    @IsString()
    @IsObjectId({
        message: "not a valid object ID",
    })
    doctor: string;
}
