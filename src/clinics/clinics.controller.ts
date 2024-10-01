import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Request,
    SetMetadata,
} from "@nestjs/common";
import { ClinicsService } from "./clinics.service";
import { CreateClinicDto } from "./dto/create-clinic.dto";
import { ClinicDocument } from "./schemas/clinic.schema";
import { IGNORE_CLINIC } from "src/shared/constants";
import { ClinicRequest, UserRequest } from "src/shared/typings";
import { UpdateClinicDto } from "./dto/update-clinic.dto";

@Controller("clinics")
export class ClinicsController {
    constructor(private clinicsService: ClinicsService) {}

    @Get()
    async get(@Request() request: ClinicRequest) {
        return this.clinicsService.get(request.clinic._id);
    }

    @Post()
    @SetMetadata(IGNORE_CLINIC, true)
    async createClinic(
        @Body() createClinicDto: CreateClinicDto,
        @Request() request: UserRequest
    ): Promise<ClinicDocument> {
        return this.clinicsService.createClinic(
            createClinicDto,
            request.payload.sub
        );
    }

    @Patch()
    async updateClinic(
        @Body() updateClinicDto: UpdateClinicDto,
        @Request() request: ClinicRequest
    ) {
        return this.clinicsService.updateClinic(
            updateClinicDto,
            request.clinic._id
        );
    }
}
