import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Alert, AlertDocument } from "./schemas/alert.schema";
import { Model } from "mongoose";
import { ObjectId } from "src/shared/typings";
import { UpdateAlertDto } from "./dto/update-alert.dto";
import { CreateAlertDto } from "./dto/create-alert.dto";

@Injectable()
export class AlertService {
    constructor(@InjectModel(Alert.name) private alertModel: Model<Alert>) {}

    async getAllAlerts(clinicId: ObjectId): Promise<Array<AlertDocument>> {
        const alerts = await this.alertModel.find({ clinicId: clinicId });
        if (alerts) {
            return alerts;
        } else {
            return [];
        }
    }

    async createAlert(createAlertDto: CreateAlertDto, clinicId: ObjectId) {
        const alreadyExist = await this.alertModel.findOne({
            clinicId: clinicId,
            type: createAlertDto.type,
        });
        if (alreadyExist) {
            Object.keys(createAlertDto).map((key) => {
                alreadyExist[key] = createAlertDto[key];
            });
            await alreadyExist.save();
            return alreadyExist;
        } else {
            const newAlert = await this.alertModel.create({
                ...createAlertDto,
                clinicId,
            });
            return newAlert;
        }
    }

    async updateAlert(
        _id: ObjectId,
        updateAlertDto: UpdateAlertDto,
        clinicId: ObjectId
    ): Promise<AlertDocument> {
        const alreadyExist = await this.alertModel.findOne({
            clinicId: clinicId,
            _id,
        });
        if (alreadyExist) {
            Object.keys(updateAlertDto).map((key) => {
                alreadyExist[key] = updateAlertDto[key];
            });
            await alreadyExist.save();
            return alreadyExist;
        } else {
            throw new NotFoundException("Alert type not found");
        }
    }
}
