import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { InjectModel } from "@nestjs/mongoose";
import { Job } from "bullmq";
import * as dayjs from "dayjs";
import { Model } from "mongoose";
import { Alert } from "src/alert/schemas/alert.schema";
import { Clinic } from "src/clinics/schemas/clinic.schema";
import { BarCode } from "src/medicines/schemas/barcode.schema";
import { Medicine } from "src/medicines/schemas/medicine.schema";
import { Notification } from "src/notifications/schemas/notification.schema";
import { Order, OrderDocument } from "src/orders/schemas/order.schema";
import { SocketGateway } from "src/socket/socket.gateway";

@Processor("alert")
export class AlertConsumer extends WorkerHost {
    constructor(
        @InjectModel(Medicine.name) private medicineModel: Model<Medicine>,
        @InjectModel(Clinic.name) private clinicModel: Model<Clinic>,
        @InjectModel(Notification.name)
        private notificationModel: Model<Notification>,
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Alert.name) private alertModel: Model<Alert>,
        @InjectModel(BarCode.name) private barcodeModel: Model<BarCode>,
        private readonly socketGateway: SocketGateway
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        try {
            switch (job.name) {
                case "minimumAlertQuantity":
                    console.log("inside one");
                    const medicines = await this.medicineModel.find({
                        clinic: job.data._id,
                        $expr: {
                            $lte: ["$stockQuantity", "$minimumAlertQuantity"],
                        },
                    });
                    if (medicines.length) {
                        const payloads = medicines.map((medicine) => {
                            return {
                                type: "MEDICINE",
                                message: `${medicine.brandName}: only ${medicine.stockQuantity} ${medicine.stockQuantityUnit} left.`,
                                clinicId: job.data._id,
                                hasRead: false,
                            };
                        });

                        // const notifications =
                        //     await this.notificationModel.insertMany(payloads);
                        // if (notifications) {
                        const companyId = job.data._id;
                        this.socketGateway.emitNotification(
                            companyId,
                            "New Notification"
                        );
                        // }
                    }

                    break;

                case "expireNear":
                    const hasExpireNear = await this.alertModel.findOne({
                        clinicId: job.data._id,
                        type: "expired_near",
                    });

                    if (hasExpireNear && hasExpireNear.enable) {
                        const comingExpireDay = dayjs()
                            .add(hasExpireNear.days, "days")
                            .startOf("day")
                            .toISOString();

                        const medicines = await this.barcodeModel
                            .find({
                                clinic: job.data._id,
                                expiredDate: { $eq: comingExpireDay },
                            })
                            .populate("medicine");

                        const payloads = medicines?.map((medicine: any) => {
                            return {
                                type: "MEDICINE",
                                message: `${medicine.medicine.brandName}:  ${medicine.quantity} ${medicine.unit} will expire in coming ${hasExpireNear.days} days.`,
                                clinicId: job.data._id,
                                hasRead: false,
                            };
                        });
                        // await this.notificationModel.insertMany(payloads);
                    }
                    break;

                case "expirePast":
                    const hasExpirePast = await this.alertModel.findOne({
                        clinicId: job.data._id,
                        type: "expired_past",
                    });
                    if (hasExpirePast && hasExpirePast.enable) {
                        const pastExiredDay = dayjs()
                            .subtract(hasExpirePast.days, "day")
                            .startOf("day")
                            .toISOString();

                        const medicines = await this.barcodeModel
                            .find({
                                clinic: job.data._id,
                                expiredDate: { $lte: pastExiredDay },
                                quantity: { $gt: 0 },
                            })
                            .populate("medicine");

                        const payloads = medicines?.map((medicine: any) => {
                            return {
                                type: "MEDICINE",
                                message: `${medicine.medicine.brandName}:  ${medicine.quantity} ${medicine.unit} was expired on ${dayjs(medicine.expiredDate).format("DD MMM,YYYY")}.`,
                                clinicId: job.data._id,
                                hasRead: false,
                            };
                        });
                        //await this.notificationModel.insertMany(payloads);
                    }
                    break;

                case "arrivalNear":
                    const hasArrivalNear = await this.alertModel.findOne({
                        clinicId: job.data._id,
                        type: "arrival_near",
                    });
                    if (hasArrivalNear && hasArrivalNear.enable) {
                        const comingArrivalDay = dayjs()
                            .add(hasArrivalNear.days, "days")
                            .startOf("day")
                            .toISOString();

                        const orders = await this.orderModel.find({
                            clinic: job.data._id,
                            estimateDate: { $eq: comingArrivalDay },
                        });

                        const payloads = orders.map((order: OrderDocument) => {
                            return {
                                type: "ORDER",
                                message: `Order with batch id (${order.batchId}) will be arrived in ${hasArrivalNear.days} ${hasArrivalNear.days === 1 ? "day" : "days"}.`,
                                clinicId: job.data._id,
                                hasRead: false,
                            };
                        });
                        // await this.notificationModel.insertMany(payloads);
                    }
                    break;

                case "arrivalDue":
                    const hasArrivalDue = await this.alertModel.findOne({
                        clinicId: job.data._id,
                        type: "arrival_due",
                    });

                    if (hasArrivalDue && hasArrivalDue.enable) {
                        const pastArrivalDue = dayjs()
                            .subtract(hasArrivalDue.days, "day")
                            .startOf("day")
                            .toISOString();
                        const orders = await this.orderModel.find({
                            clinic: job.data._id,
                            estimateDate: { $lte: pastArrivalDue },
                        });

                        const payloads = orders.map((order: OrderDocument) => {
                            return {
                                type: "ORDER",
                                message: `Order with batch id (${order.batchId}) should have arrived on ${dayjs(order.estimateDate).format("DD MMM,YYYY")}.`,
                                clinicId: job.data._id,
                                hasRead: false,
                            };
                        });
                        //await this.notificationModel.insertMany(payloads);
                        console.log("DONE");
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.error(`Error processing job ${job.id}:`, error);

            throw error;
        }
    }

    @OnWorkerEvent("active")
    onActive(job: Job) {
        // console.log(
        //     `Processing job ${job.id} of type ${job.name} with data ${job.data}...`
        // );
    }

    @OnWorkerEvent("completed")
    onCompleted(job: Job, result: any) {
        //console.log(`Job ${job.id} completed with result:`, result);
    }

    @OnWorkerEvent("failed")
    onFailed(job: Job, error: any) {
        /// console.error(`Job ${job.id} failed with error:`, error);
    }
}
