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
import { PatientsService } from "./patients.service";
import {
    GetMultipleObjectsDto,
    GetSingleObjectDto,
} from "src/shared/dto/get-info.dto";
import { ClinicRequest } from "src/shared/typings";
import { CreatePatientDto } from "./dtos/create-patient.dto";
import { UpdatePatientDto } from "./dtos/update-patient.dto";

@Controller("patients")
export class PatientsController {
    constructor(private patientService: PatientsService) {}

    @Get()
    async getAllPatients(
        @Query() query: GetMultipleObjectsDto,
        @Request() request: ClinicRequest
    ) {
        return this.patientService.getAllPatients(query, request.clinic._id);
    }

    @Get(":_id")
    async getPatient(
        @Param() { _id }: GetSingleObjectDto,
        @Request() request: ClinicRequest
    ) {
        return this.patientService.getPatient(_id, request.clinic._id);
    }

    @Post()
    async createPatient(
        @Body() dto: CreatePatientDto,
        @Request() request: ClinicRequest
    ) {
        return this.patientService.createPatient(dto, request.clinic._id);
    }

    @Patch(":_id")
    async updateMedicine(
        @Param() { _id }: GetSingleObjectDto,
        @Body() updatePatientDto: UpdatePatientDto,
        @Request() request: ClinicRequest
    ) {
        return this.patientService.updatePatient(
            _id,
            updatePatientDto,
            request.clinic._id
        );
    }
    @Delete(":_id")
    async deleteMedicine(@Param() { _id }: GetSingleObjectDto) {
        return this.patientService.deletePatient(_id);
    }
}
