import { Injectable } from "@nestjs/common";
import * as TelegramBot from "node-telegram-bot-api";

@Injectable()
export class TelegramService {
    private readonly bot: TelegramBot;

    constructor() {
        this.bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
            polling: true,
        });

        this.bot.on("message", this.onReceiveMessage);
    }

    onReceiveMessage = (msg: any) => {
        console.log("id", msg.chat.id);
        console.log("title", msg.chat.title);
    };

    sendMessageToUser = (userId: string, message: string) => {
        this.bot.sendMessage(userId, message);
    };
}
