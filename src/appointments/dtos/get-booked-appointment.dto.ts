import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class GetBookedAppointmentDto {
    @IsOptional()
    @IsString()
    @IsObjectId({
        message: "not a valid object ID",
    })
    _id?: string;

    @IsNotEmpty()
    @IsString()
    @IsObjectId({
        message: "not a valid object ID",
    })
    doctor: string;

    @IsNotEmpty()
    @IsDateString()
    appointmentDate: string;
}
