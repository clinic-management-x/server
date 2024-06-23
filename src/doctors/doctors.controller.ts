import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { DoctorsService } from "./doctors.service";
import { GetDoctorsDto } from "./dto/get-doctors.dto";
import { Doctor } from "./schemas/doctor.schema";
import { CreateDoctorDto } from "./dto/create-doctor-dto";
import { Speciality } from "./schemas/speciality.schema";

@Controller("doctors")
export class DoctorsController {
    constructor(private doctorService: DoctorsService) {}

    @Get()
    async getAll(@Query() query: GetDoctorsDto): Promise<Array<Doctor>> {
        return this.doctorService.getAll(query);
    }

    @Get("specialities")
    async getSpecialities(): Promise<Array<Speciality>> {
        return this.doctorService.getSpecialities();
    }

    @Post()
    async createDoctor(
        @Body() createDoctorDto: CreateDoctorDto
    ): Promise<Doctor> {
        return this.doctorService.createDoctor(createDoctorDto);
    }
}
