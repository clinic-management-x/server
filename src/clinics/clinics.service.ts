import {
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Clinic, ClinicDocument } from "./schemas/clinic.schema";
import { Model } from "mongoose";
import { ObjectId } from "src/shared/typings";
import { CreateClinicDto } from "./dto/create-clinic.dto";
import { UpdateClinicDto } from "./dto/update-clinic.dto";

@Injectable()
export class ClinicsService {
    constructor(@InjectModel(Clinic.name) private clinicModel: Model<Clinic>) {}

    async get(_id: ObjectId): Promise<ClinicDocument> {
        const clinic = await this.clinicModel.findById(_id);
        if (!clinic) throw new NotFoundException("Clinic not found");
        return clinic;
    }

    async getClinicByUserId(userId: ObjectId): Promise<ClinicDocument> {
        const clinic = await this.clinicModel.findOne({ user: userId }).exec();
        if (!clinic) throw new NotFoundException("Clinic not found");
        return clinic;
    }

    async createClinic(
        data: CreateClinicDto,
        userId: ObjectId
    ): Promise<ClinicDocument> {
        if (await this.clinicModel.exists({ user: userId })) {
            throw new ConflictException("Clinic already exists");
        }

        const clinic = new this.clinicModel({ ...data, user: userId });
        return clinic.save();
    }

    async updateClinic(data: UpdateClinicDto, clinicId: ObjectId) {
        const clinic = await this.clinicModel.findById(clinicId);
        if (!clinic) throw new NotFoundException("Clinic not found");

        Object.keys(data).forEach((key) => {
            clinic[key] = data[key];
        });

        const updatedClinic = await clinic.save();
        return updatedClinic;
    }
}
