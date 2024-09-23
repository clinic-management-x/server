import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Request,
} from "@nestjs/common";
import { AlertService } from "./alert.service";
import { ClinicRequest } from "src/shared/typings";
import { CreateAlertDto } from "./dto/create-alert.dto";
import { AlertIdDto, UpdateAlertDto } from "./dto/update-alert.dto";

@Controller("alert")
export class AlertController {
    constructor(private alertService: AlertService) {}

    @Get()
    async GetAllAlerts(@Request() request: ClinicRequest) {
        return this.alertService.getAllAlerts(request.clinic._id);
    }

    @Post()
    async CreateAlert(
        @Body() createAlertDto: CreateAlertDto,
        @Request() request: ClinicRequest
    ) {
        return this.alertService.createAlert(
            createAlertDto,
            request.clinic._id
        );
    }

    @Patch(":_id")
    async UpdateAlert(
        @Param() { _id }: AlertIdDto,
        @Body() updateAlertDto: UpdateAlertDto,
        @Request() request: ClinicRequest
    ) {
        return this.alertService.updateAlert(
            _id,
            updateAlertDto,
            request.clinic._id
        );
    }
}
