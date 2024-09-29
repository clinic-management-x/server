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
import { CreateTelegramInfo } from "./dtos/create-telegram-info.dto";
import { TelegramService } from "./telegram.service";
import { ClinicRequest } from "src/shared/typings";
import { GetTelegramInfoDto } from "./dtos/get-telegram-info.dto";
import { UpdateTelegramInfoDto } from "./dtos/update-telegram-info.dto";

@Controller("telegram")
export class TelegramController {
    constructor(private telegramService: TelegramService) {}

    @Get()
    async getAll(@Request() request: ClinicRequest) {
        return this.telegramService.getAllTelegramInfo(request.clinic._id);
    }

    @Post()
    async create(@Body() data: CreateTelegramInfo) {
        return this.telegramService.createTelegramInfo(data);
    }

    @Patch("/:_id")
    async update(
        @Param() { _id }: GetTelegramInfoDto,
        @Body() updateDto: UpdateTelegramInfoDto
    ) {
        return this.telegramService.updateTelegramInfo(_id, updateDto);
    }
    @Delete("/:_id")
    async deleteSupplier(@Param() { _id }: GetTelegramInfoDto) {
        return this.telegramService.deleteTelegramInfo(_id);
    }
}
