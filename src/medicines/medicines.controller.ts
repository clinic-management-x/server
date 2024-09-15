import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Request,
} from "@nestjs/common";
import { MedicinesService } from "./medicines.service";

import { GetDrugInfoDto } from "src/shared/dto/get-drug-info.dto";
import {
    ActiveIngredientCreateDto,
    CreateMedicineDto,
} from "./dto/create-medicine.dto";
import { ClinicRequest } from "src/shared/typings";
import { GetMedicinesDto } from "./dto/get-medicines.dto";
import { GetMedicineDto } from "./dto/get-medicine.dto";
import {
    UpdateActiveIngredientDto,
    UpdateMedicineDto,
} from "./dto/update-medicine.dto";
import { DeleteIngredientDto } from "./dto/delete-ingredeint.dto";
import { CreateBarcodeDto } from "./dto/barcode-dto";
import { BarCodeService } from "./barcode.service";

@Controller("medicines")
export class MedicinesController {
    constructor(
        private medicinesService: MedicinesService,
        private barcodeService: BarCodeService
    ) {}

    @Get("generic-drugs")
    async getAllGenericDrugs(@Query() query: GetDrugInfoDto) {
        return this.medicinesService.getAllGenericDrugs(query);
    }
    @Get("active-ingredients")
    async getAllActiveIngrideints(@Query() query: GetDrugInfoDto) {
        return this.medicinesService.getAllActiveIngridients(query);
    }

    @Get()
    async getAllMedicines(
        @Query() query: GetMedicinesDto,
        @Request() request: ClinicRequest
    ) {
        return this.medicinesService.getAllMedicines(query, request.clinic._id);
    }

    @Get("/list")
    async getMedicinesList(
        @Query() query: GetDrugInfoDto,
        @Request() request: ClinicRequest
    ) {
        return this.medicinesService.getMedicinesList(
            query,
            request.clinic._id
        );
    }

    @Get("/barcodes")
    async getAllBarcodes(
        @Query() query: GetMedicinesDto,
        @Request() request: ClinicRequest
    ) {
        return this.barcodeService.getAllBarcodes(query, request.clinic._id);
    }

    @Get(":_id")
    async get(
        @Param() { _id }: GetMedicineDto,
        @Request() request: ClinicRequest
    ): Promise<object> {
        return this.medicinesService.getMedicine(_id, request.clinic._id);
    }

    @Post()
    async createMedicine(
        @Body() createMedicineDto: CreateMedicineDto,
        @Request() request: ClinicRequest
    ) {
        return this.medicinesService.createMedicine(
            createMedicineDto,
            request.clinic._id
        );
    }

    @Post("/barcodes")
    async createBarcode(
        @Body() createBarcodeDto: CreateBarcodeDto[],
        @Request() request: ClinicRequest
    ) {
        return this.barcodeService.createBarCodes(
            createBarcodeDto,
            request.clinic._id
        );
    }

    @Patch(":_id")
    async updateMedicine(
        @Param() { _id }: GetMedicineDto,
        @Body() updateMedicineDto: UpdateMedicineDto,
        @Request() request: ClinicRequest
    ) {
        return this.medicinesService.updateMedicine(
            _id,
            updateMedicineDto,
            request.clinic._id
        );
    }
    @Delete(":_id")
    async deleteMedicine(
        @Param() { _id }: GetMedicineDto,
        @Request() request: ClinicRequest
    ) {
        return this.medicinesService.deleteMedicine(_id, request.clinic._id);
    }

    @Put("/active-ingredient-component/:_id")
    async createActiveIngredientComponent(
        @Param() { _id }: GetMedicineDto,
        @Body() dto: ActiveIngredientCreateDto,
        @Request() request: ClinicRequest
    ) {
        return this.medicinesService.createActiveIngredientComponent(
            _id,
            dto,
            request.clinic._id
        );
    }

    @Patch("/active-ingredient-component/:_id")
    async updateActiveIngredeintComponent(
        @Param() { _id }: GetMedicineDto,
        @Body() dto: UpdateActiveIngredientDto
    ) {
        return this.medicinesService.updateActiveIngredientComponent(_id, dto);
    }

    @Delete("/active-ingredient-component/:_id")
    async deleteActiveIngredientComponent(
        @Param() { _id }: GetMedicineDto,
        @Query() { medicineId }: DeleteIngredientDto,
        @Request() request: ClinicRequest
    ) {
        return this.medicinesService.deleteActiveIngredientComponent(
            _id,
            medicineId,
            request.clinic._id
        );
    }
}
