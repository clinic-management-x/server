import {
    Body,
    Controller,
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
import { ClinicRequest, ObjectList } from "src/shared/typings";

@Controller("doctors")
export class DoctorsController {
    constructor(private doctorsService: DoctorsService) {}

    @Get()
    async getAll(
        @Query() query: GetDoctorsDto,
        @Request() request: ClinicRequest
    ): Promise<ObjectList<DoctorDocument>> {
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
    ): Promise<DoctorDocument> {
        return this.doctorsService.getOne(_id, request.clinic._id);
    }

    @Patch(":_id/details")
    async updateDetails(
        @Param() { _id }: GetDoctorDto,
        @Body() data: UpdateDoctorDetailsDto,
        @Request() request: ClinicRequest
    ): Promise<DoctorDocument> {
        return this.doctorsService.updateDetails(_id, data, request.clinic._id);
    }
}
