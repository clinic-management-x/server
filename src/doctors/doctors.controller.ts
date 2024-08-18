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
import { DoctorsService } from "./doctors.service";
import { GetDoctorsDto } from "./dto/get-doctors.dto";
import { DoctorDocument } from "./schemas/doctor.schema";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { SpecialityDocument } from "./schemas/speciality.schema";
import { GetDoctorDto } from "./dto/get-doctor.dto";
import { UpdateDoctorDetailsDto } from "./dto/update-doctor-details.dto";
import { ClinicRequest } from "src/shared/typings";
import { ScheduleDocument } from "./schemas/schedule.schema";
import { CreateScheduleDto, ScheduleDto } from "./dto/create-schedule.dto";
import { SchedulesService } from "./schedules.service";
import { GetScheduleDto } from "./dto/get-schedule.dto";

@Controller("doctors")
export class DoctorsController {
    constructor(
        private doctorsService: DoctorsService,
        private schedulesService: SchedulesService
    ) {}

    @Get()
    async getAll(
        @Query() query: GetDoctorsDto,
        @Request() request: ClinicRequest
    ) {
        return this.doctorsService.getAll(query, request.clinic._id);
    }

    @Get("specialities")
    async getSpecialities(): Promise<Array<SpecialityDocument>> {
        return this.doctorsService.getSpecialities();
    }

    @Post()
    async createDoctor(
        @Body() createDoctorDto: CreateDoctorDto,
        @Request() request: ClinicRequest
    ): Promise<DoctorDocument> {
        return this.doctorsService.createDoctor(
            createDoctorDto,
            request.clinic._id
        );
    }

    @Get(":_id")
    async get(
        @Param() { _id }: GetDoctorDto,
        @Request() request: ClinicRequest
    ): Promise<Object> {
        return this.doctorsService.getPopulated(_id, request.clinic._id);
    }

    @Patch(":_id/details")
    async updateDetails(
        @Param() { _id }: GetDoctorDto,
        @Body() data: UpdateDoctorDetailsDto,
        @Request() request: ClinicRequest
    ): Promise<DoctorDocument> {
        return this.doctorsService.updateDetails(_id, data, request.clinic._id);
    }

    @Delete(":_id")
    async delete(
        @Param() { _id }: GetDoctorDto,
        @Request() request: ClinicRequest
    ): Promise<object> {
        return this.doctorsService.deleteDoctor(_id, request.clinic._id);
    }

    // Doctor schedules
    @Post("schedules")
    async createDoctorSchedules(
        @Body() data: CreateScheduleDto,
        @Request() request: ClinicRequest
    ): Promise<Array<ScheduleDocument>> {
        return this.schedulesService.createDoctorSchedules(
            data,
            request.clinic._id
        );
    }

    @Patch("schedules/:_id")
    async updateDoctorSchedule(
        @Param() { _id }: GetScheduleDto,
        @Body() dto: ScheduleDto,
        @Request() request: ClinicRequest
    ): Promise<ScheduleDocument> {
        return this.schedulesService.updateDoctorSchedule(
            _id,
            dto,
            request.clinic._id
        );
    }

    @Delete("schedules/:_id")
    async deleteDoctorSchedule(
        @Param() { _id }: GetScheduleDto,
        @Request() request: ClinicRequest
    ): Promise<object> {
        return this.schedulesService.deleteDoctorSchedule(
            _id,
            request.clinic._id
        );
    }
}
