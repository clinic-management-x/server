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
import { CreateStaffDto } from "./dto/create-staff.dto";
import { StaffDocument } from "./schemas/staff.schema";
import { ClinicRequest, ObjectList } from "src/shared/typings";
import { StaffsService } from "./staffs.service";
import { UpdateStaffDto } from "./dto/update-staff.dto";
import { GetStaffDto } from "./dto/get-staff.dto";
import { GetStaffsDto } from "./dto/get-staffs.dto";

@Controller("staffs")
export class StaffsController {
    constructor(private staffsService: StaffsService) {}

    @Get()
    async findStaffs(
        @Query() query: GetStaffsDto,
        @Request() request: ClinicRequest
    ): Promise<ObjectList<StaffDocument>> {
        return this.staffsService.findStaffs(query, request.clinic._id);
    }

    @Get("/:_id")
    async findStaff(
        @Param() { _id }: GetStaffDto,
        @Request() request: ClinicRequest
    ): Promise<StaffDocument> {
        return this.staffsService.findStaff(_id, request.clinic._id);
    }

    @Post()
    async create(
        @Body() createStaffDto: CreateStaffDto,
        @Request() request: ClinicRequest
    ): Promise<StaffDocument> {
        return this.staffsService.create(createStaffDto, request.clinic._id);
    }

    @Patch("/:_id")
    async update(
        @Param() { _id }: GetStaffDto,
        @Body() updateStaffDto: UpdateStaffDto,
        @Request() request: ClinicRequest
    ): Promise<StaffDocument> {
        return this.staffsService.update(
            _id,
            updateStaffDto,
            request.clinic._id
        );
    }

    @Delete("/:_id")
    async delete(
        @Param() { _id }: GetStaffDto,
        @Request() request: ClinicRequest
    ): Promise<object> {
        return this.staffsService.delete(_id, request.clinic._id);
    }
}
