import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { AppointmentStatus, Necessity } from "src/shared/shared.enum";

export class UpdateAppointmentDto {
    @IsOptional()
    @IsString()
    @IsObjectId({
        message: "not a valid object ID",
    })
    doctor?: string;

    @IsOptional()
    @IsDateString()
    appointmentDate: string;

    @IsOptional()
    @IsDateString()
    appointmentStartTime: string;

    @IsOptional()
    @IsDateString()
    appointmentEndTime: string;

    @IsOptional()
    @IsEnum(Necessity)
    necessity?: string;

    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: string;
}
