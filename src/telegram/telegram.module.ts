import { Module } from "@nestjs/common";
import { TelegramController } from "./telegram.controller";
import { TelegramService } from "./telegram.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
    TelegramGroupInfo,
    TelegramInfoSchema,
} from "./schemas/telegram-info.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: TelegramGroupInfo.name, schema: TelegramInfoSchema },
        ]),
    ],
    controllers: [TelegramController],
    providers: [TelegramService],
})
export class TelegramModule {}
