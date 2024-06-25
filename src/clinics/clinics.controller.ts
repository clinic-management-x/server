import { Body, Controller, Post, Request, SetMetadata } from "@nestjs/common";
import { ClinicsService } from "./clinics.service";
import { CreateClinicDto } from "./dto/create-clinic.dto";
import { ClinicDocument } from "./schemas/clinic.schema";
import { IGNORE_CLINIC } from "src/shared/constants";
import { UserRequest } from "src/shared/typings";

@Controller("clinics")
export class ClinicsController {
    constructor(private clinicsService: ClinicsService) {}

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
}
