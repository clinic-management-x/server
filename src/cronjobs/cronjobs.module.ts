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

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Medicine.name, schema: MedicineSchema },
            { name: Clinic.name, schema: ClinicSchema },
            { name: Notification.name, schema: NotificationSchema },
        ]),
    ],
    providers: [CronjobsService],
})
export class CronjobsModule {}
