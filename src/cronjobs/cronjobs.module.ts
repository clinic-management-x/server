import { Module } from "@nestjs/common";
import { CronjobsService } from "./cronjobs.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
    Medicine,
    MedicineSchema,
} from "src/medicines/schemas/medicine.schema";
import { Clinic, ClinicSchema } from "src/clinics/schemas/clinic.schema";
import {
    Notification,
    NotificationSchema,
} from "src/notifications/schemas/notification.schema";
import { BullModule } from "@nestjs/bullmq";
import { AlertConsumer } from "./processor.service";
import { Alert, AlertSchema } from "src/alert/schemas/alert.schema";
import { BarCode, BarCodeSchema } from "src/medicines/schemas/barcode.schema";
import { Order, OrderSchema } from "src/orders/schemas/order.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Medicine.name, schema: MedicineSchema },
            { name: Clinic.name, schema: ClinicSchema },
            { name: Notification.name, schema: NotificationSchema },
            { name: Alert.name, schema: AlertSchema },
            { name: BarCode.name, schema: BarCodeSchema },
            { name: Order.name, schema: OrderSchema },
        ]),
        BullModule.forRoot({
            connection: {
                host: "localhost",
                port: 6379,
            },
        }),
        BullModule.registerQueue({
            name: "alert", // Register the "alert" queue
        }),
    ],
    providers: [CronjobsService, AlertConsumer],
})
export class CronjobsModule {}
