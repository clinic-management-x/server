import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
    Notification,
    NotificationDocument,
} from "./schemas/notification.schema";
import { Model } from "mongoose";
import { GetNotificationsDto } from "./dtos/get-notifications.dto";
import { ObjectId, ObjectList } from "src/shared/typings";
import { CreateNotificationDto } from "./dtos/create-notification.dto";
import { UpdateNotificationDto } from "./dtos/update-notification.dto";

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name)
        private notificationModel: Model<Notification>
    ) {}

    async getAllNotifications(
        query: GetNotificationsDto,
        clinicId: ObjectId
    ): Promise<ObjectList<NotificationDocument>> {
        const filter = {
            ...(query.type ? { type: query.type } : {}),
            clinicId,
        };
        const [data, count] = await Promise.all([
            this.notificationModel
                .find(filter)
                .skip(query.skip)
                .limit(query.limit)
                .populate("speciality")
                .exec(),
            this.notificationModel
                .find({ ...filter, hasRead: false })
                .countDocuments(),
        ]);
        return { data, count };
    }

    async createNotification(
        createNotificationDto: CreateNotificationDto,
        clinicId: ObjectId
    ): Promise<NotificationDocument> {
        const notification = await this.notificationModel.create({
            ...createNotificationDto,
            clinicId,
        });
        if (notification) {
            return notification;
        } else {
            throw new InternalServerErrorException("Something went wrong.");
        }
    }

    async updateNotification(
        updateNotificationDto: UpdateNotificationDto,
        clinicId: ObjectId
    ): Promise<NotificationDocument> {
        const notificationToUpdate = await this.notificationModel.findOne({
            _id: updateNotificationDto._id,
            clinicId,
        });
        if (notificationToUpdate) {
            notificationToUpdate.hasRead = updateNotificationDto.hasRead;

            await notificationToUpdate.save();
            return notificationToUpdate;
        } else {
            throw new BadRequestException("No data found.");
        }
    }
}
