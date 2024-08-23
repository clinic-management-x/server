import { Controller, Get, Request } from "@nestjs/common";
import { MedicinesService } from "./medicines.service";
import { ClinicRequest } from "src/shared/typings";

@Controller("medicines")
export class MedicinesController {
    constructor(private medicinesService: MedicinesService) {}

    @Get("generic-drugs")
    async getAll(@Request() request: ClinicRequest) {
        return this.medicinesService.getAllGenericDrugs();
    }
}
