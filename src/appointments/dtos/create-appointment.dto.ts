import { IsDateString, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { Necessity } from "src/shared/shared.enum";

export class CreateAppointmentDto {
    @IsNotEmpty()
    @IsString()
    @IsObjectId({
        message: "not a valid object ID",
    })
    patient: string;

    @IsNotEmpty()
    @IsString()
    @IsObjectId({
        message: "not a valid object ID",
    })
    doctor: string;

    @IsNotEmpty()
    @IsDateString()
    appointmentDate: string;

    @IsNotEmpty()
    @IsDateString()
    appointmentStartTime: string;

    @IsNotEmpty()
    @IsDateString()
    appointmentEndTime: string;

    @IsNotEmpty()
    @IsEnum(Necessity)
    necessity: string;
}
