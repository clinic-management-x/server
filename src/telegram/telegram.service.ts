import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import * as TelegramBot from "node-telegram-bot-api";
import { CreateTelegramInfo } from "./dtos/create-telegram-info.dto";
import { TelegramGroupInfo } from "./schemas/telegram-info.schema";
import { Model } from "mongoose";
import { ObjectId } from "src/shared/typings";
import { InjectModel } from "@nestjs/mongoose";
import { UpdateTelegramInfoDto } from "./dtos/update-telegram-info.dto";

@Injectable()
export class TelegramService {
    private readonly bot: TelegramBot;
    constructor(
        @InjectModel(TelegramGroupInfo.name)
        private telegramInfoModel: Model<TelegramGroupInfo>
    ) {
        // this.bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
        //     polling: true,
        // });

        // this.bot.on("message", this.onReceiveMessage);
        if (!this.bot) {
            this.bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

            // Set your server's URL for Telegram to send updates to
            this.bot.setWebHook(`${process.env.SERVER_URL}/telegram/webhook`);

            this.bot.on("message", this.onReceiveMessage);
        }
    }

    onReceiveMessage = (msg: any) => {
        console.log("MESSAGE", msg);
        if (msg.text === "/groupId") {
            this.sendMessageToUser(msg.chat.id, `chatId: ${msg.chat.id}`);
        }
    };

    sendMessageToUser = (userId: string, message: string) => {
        this.bot.sendMessage(userId, message);
    };

    findTelegramInfo = async (supplierId: ObjectId, clinicId: ObjectId) => {
        try {
            const telegramInfo = await this.telegramInfoModel.findOne({
                supplierId,
                clinicId,
            });
            return telegramInfo;
        } catch (error) {
            throw new NotFoundException("Telegram Info Not found");
        }
    };

    getAllTelegramInfo = async (clinicId: ObjectId) => {
        const telegramDatas = await this.telegramInfoModel
            .find({
                clinicId,
            })
            .populate({
                path: "supplierId",
                select: "_id name",
            });
        return telegramDatas;
    };

    createTelegramInfo = async (data: CreateTelegramInfo) => {
        try {
            const telegramInfo = await this.telegramInfoModel.create(data);
            return telegramInfo;
        } catch (error) {
            throw new InternalServerErrorException("Something went wrong.");
        }
    };

    updateTelegramInfo = async (
        _id: ObjectId,
        updateDto: UpdateTelegramInfoDto
    ) => {
        try {
            const updatedData = await this.telegramInfoModel.findByIdAndUpdate(
                _id,
                { groupId: updateDto.groupId }
            );
            return updatedData;
        } catch (error) {
            throw new InternalServerErrorException("Something went wrong.");
        }
    };

    deleteTelegramInfo = async (_id: ObjectId) => {
        try {
            const deletedData =
                await this.telegramInfoModel.findByIdAndDelete(_id);
            return deletedData;
        } catch (error) {
            throw new InternalServerErrorException("Something went wrong.");
        }
    };
}
