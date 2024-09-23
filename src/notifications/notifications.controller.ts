import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Query,
    Request,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { GetNotificationsDto } from "./dtos/get-notifications.dto";
import { ClinicRequest } from "src/shared/typings";
import { CreateNotificationDto } from "./dtos/create-notification.dto";
import { UpdateNotificationDto } from "./dtos/update-notification.dto";

@Controller("notifications")
export class NotificationsController {
    constructor(private notificationService: NotificationsService) {}

    @Get()
    async GetAllNotifications(
        @Query() query: GetNotificationsDto,
        @Request() request: ClinicRequest
    ) {
        return this.notificationService.getAllNotifications(
            query,
            request.clinic._id
        );
    }

    @Post()
    async CreateNotification(
        @Body() createNotificationDto: CreateNotificationDto,
        @Request() request: ClinicRequest
    ) {
        return this.notificationService.createNotification(
            createNotificationDto,
            request.clinic._id
        );
    }

    @Patch()
    async UpdateNotification(
        @Body() updateNotificationDto: UpdateNotificationDto,
        @Request() request: ClinicRequest
    ) {
        return this.notificationService.updateNotification(
            updateNotificationDto,
            request.clinic._id
        );
    }
}
