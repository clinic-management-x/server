import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import { Model } from "mongoose";
import { Clinic } from "src/clinics/schemas/clinic.schema";
import { Medicine } from "src/medicines/schemas/medicine.schema";
import { Notification } from "src/notifications/schemas/notification.schema";

// class JobQueue<T> {
//     jobs: T[];
//     currentJob: T | null;
//     constructor() {
//         this.jobs = [];
//         this.currentJob = null;
//     }
//     enqueue(job: T) {
//         this.jobs.push(job);
//         this.executeNext();
//     }
//     dequeue() {
//         return this.jobs.shift();
//     }
//     executeNext() {
//         if (this.currentJob) return;
//         const current = this.dequeue();
//         if (!current) return;
//         this.execute(current);
//     }
//     execute(job: T) {
//         console.log("job", job);
//     }
// }

@Injectable()
export class CronjobsService {
    constructor(
        @InjectModel(Medicine.name) private medicineModel: Model<Medicine>,
        @InjectModel(Clinic.name) private clinicModel: Model<Clinic>,
        @InjectModel(Notification.name)
        private notificationModel: Model<Notification>
    ) {}

    // @Cron("0 * * * * *")
    async checkMinimumAlertQuantity() {
        const clinics = await this.clinicModel.find().select("_id");
        for (let i = 0; i < clinics.length; i++) {
            const medicines = await this.medicineModel.find({
                clinic: clinics[i]._id,
            });
            const payloads = medicines.map((medicine) => {
                return {
                    type: "MEDICINE",
                    message: `${medicine.brandName}: only ${medicine.stockQuantity} ${medicine.stockQuantityUnit} left.`,
                    clinicId: clinics[i].id,
                    hasRead: false,
                };
            });
            const notifications = new this.notificationModel(payloads);
            await notifications.save();

            await console.log("medicines", payloads);
        }
    }
}
