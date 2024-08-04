import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Request,
} from "@nestjs/common";
import { SuppliersService } from "./suppliers.service";
import { SupplierDocument } from "./schemas/supplier.schema";
import { ClinicRequest } from "src/shared/typings";
import { CreateSupplierDto, MRDto } from "./dto/create-supplier.dto";
import { GetSupplierDto } from "./dto/get-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { UpdateMRDto } from "./dto/update-mr.dto";

@Controller("suppliers")
export class SuppliersController {
    constructor(private supplierService: SuppliersService) {}

    @Get()
    async getAll(@Request() request: ClinicRequest) {
        return this.supplierService.getAll(request.clinic._id);
    }

    @Get("/:_id")
    async get(
        @Param() { _id }: GetSupplierDto,
        @Request() request: ClinicRequest
    ) {
        return this.supplierService.get(_id, request.clinic._id);
    }

    @Post()
    async create(
        @Body() supplierDto: CreateSupplierDto,
        @Request() request: ClinicRequest
    ): Promise<SupplierDocument> {
        return this.supplierService.create(supplierDto, request.clinic._id);
    }

    @Post("/mr")
    async createMR(@Body() mrDto: MRDto, @Request() request: ClinicRequest) {
        return this.supplierService.createMR(mrDto, request.clinic._id);
    }

    @Patch("/:_id")
    async update(
        @Param() { _id }: GetSupplierDto,
        @Body() updateDto: UpdateSupplierDto,
        @Request() request: ClinicRequest
    ) {
        return this.supplierService.updateSupplier(
            _id,
            updateDto,
            request.clinic._id
        );
    }
    @Patch("/mr/:_id")
    async updateSupplierRepresentative(
        @Param() { _id }: GetSupplierDto,
        @Body() updateDto: UpdateMRDto,
        @Request() request: ClinicRequest
    ) {
        return this.supplierService.updateSupplierRepresentaive(
            _id,
            updateDto,
            request.clinic._id
        );
    }

    @Delete("/:_id")
    async deleteSupplier(
        @Param() { _id }: GetSupplierDto,
        @Request() request: ClinicRequest
    ) {
        return this.supplierService.deleteSupplier(_id, request.clinic._id);
    }

    @Delete("/mr/:_id")
    async deleteMR(
        @Param() { _id }: GetSupplierDto,
        @Request() request: ClinicRequest
    ) {
        return this.supplierService.deleteMR(_id, request.clinic._id);
    }
}
