import { Module } from "@nestjs/common";
import { AlertService } from "./alert.service";
import { AlertController } from "./alert.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Alert, AlertSchema } from "./schemas/alert.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Alert.name, schema: AlertSchema }]),
    ],
    providers: [AlertService],
    controllers: [AlertController],
})
export class AlertModule {}
