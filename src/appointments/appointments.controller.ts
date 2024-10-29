import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request,
} from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";
import { GetSingleObjectDto } from "src/shared/dto/get-info.dto";
import { ClinicRequest } from "src/shared/typings";
import { CreateAppointmentDto } from "./dtos/create-appointment.dto";
import { UpdateAppointmentDto } from "./dtos/update-appointment.dto";
import { GetBookedAppointmentDto } from "./dtos/get-booked-appointment.dto";
import {
    GetAppointmentsByDateDto,
    GetAppointmentsDto,
} from "./dtos/get-appointments.dto";

@Controller("appointments")
export class AppointmentsController {
    constructor(private appointmentService: AppointmentsService) {}

    @Get()
    async GetAll(
        @Query() query: GetAppointmentsDto,
        @Request() request: ClinicRequest
    ) {
        return this.appointmentService.getAppointments(
            query,
            request.clinic._id
        );
    }

    @Get("/datefilter")
    async GetAppoitmentsByDate(
        @Query() query: GetAppointmentsByDateDto,
        @Request() request: ClinicRequest
    ) {
        return this.appointmentService.getAppointmentsByDate(
            query,
            request.clinic._id
        );
    }

    @Get("/booked-appointments")
    async GetBookedAppointments(
        @Query() query: GetBookedAppointmentDto,
        @Request() request: ClinicRequest
    ) {
        return this.appointmentService.getBookedAppointments(
            query,
            request.clinic._id
        );
    }

    @Post()
    async CreateAppointment(
        @Body() dto: CreateAppointmentDto,
        @Request() request: ClinicRequest
    ) {
        return this.appointmentService.createAppointment(
            dto,
            request.clinic._id
        );
    }

    @Post("/multiple-delete")
    async deleteMultipleAppointments(
        @Body() { data }: { data: string[] },
        @Request() request: ClinicRequest
    ) {
        console.log("data", data);
        return this.appointmentService.deleteAppointments(
            data,
            request.clinic._id
        );
    }

    @Patch(":_id")
    async UpdateAppointment(
        @Param() { _id }: GetSingleObjectDto,
        @Body() dto: UpdateAppointmentDto,
        @Request() request: ClinicRequest
    ) {
        return this.appointmentService.updateAppointment(
            _id,
            dto,
            request.clinic._id
        );
    }

    @Delete(":_id")
    async deleteMedicine(@Param() { _id }: GetSingleObjectDto) {
        return this.appointmentService.deleteAppointment(_id);
    }
}
