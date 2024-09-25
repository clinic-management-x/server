import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import { Queue } from "bullmq";
import * as dayjs from "dayjs";
import { Model } from "mongoose";
import { Clinic } from "src/clinics/schemas/clinic.schema";
import { Medicine } from "src/medicines/schemas/medicine.schema";
import { Notification } from "src/notifications/schemas/notification.schema";

@Injectable()
export class CronjobsService {
    constructor(
        @InjectModel(Medicine.name) private medicineModel: Model<Medicine>,
        @InjectModel(Clinic.name) private clinicModel: Model<Clinic>,
        @InjectModel(Notification.name)
        private notificationModel: Model<Notification>,
        @InjectQueue("alert") private alertQueue: Queue
    ) {}

    @Cron("0 0 6 * * *")
    async checkMinimumAlertQuantity() {
        const clinics = await this.clinicModel.find().select("_id");

        for (const clinic of clinics) {
            await this.alertQueue.add("minimumAlertQuantity", clinic, {
                delay: 5000,
                removeOnComplete: true,
            });
            await this.alertQueue.add("expireNear", clinic, {
                delay: 5000,
                removeOnComplete: true,
            });
            await this.alertQueue.add("expirePast", clinic, {
                delay: 5000,
                removeOnComplete: true,
            });

            await this.alertQueue.add("arrivalNear", clinic, {
                delay: 5000,
                removeOnComplete: true,
            });
            await this.alertQueue.add("arrivalDue", clinic, {
                delay: 5000,
                removeOnComplete: true,
            });
        }
    }

    @Cron("0 0 6 * * *")
    async deleteNotificationOver30Days() {
        const thiryDaysAgo = dayjs().subtract(30, "day").toISOString();

        try {
            await this.notificationModel.deleteMany({
                createdAt: {
                    $lt: thiryDaysAgo,
                },
            });
        } catch (error) {}
    }
}
