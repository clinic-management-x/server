import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Patient, PatientDocument } from "./schemas/patient.schema";
import { Model } from "mongoose";
import { CreatePatientDto } from "./dtos/create-patient.dto";
import { UpdatePatientDto } from "./dtos/update-patient.dto";
import { GetMultipleObjectsDto } from "src/shared/dto/get-info.dto";
import { ObjectId, ObjectList } from "src/shared/typings";
import * as QRCode from "qrcode";
import { nanoid } from "nanoid";
import { FilesService } from "src/files/files.service";
import { FilePurpose } from "src/shared/shared.enum";

@Injectable()
export class PatientsService {
    constructor(
        @InjectModel(Patient.name) private patientModel: Model<Patient>,
        private filesService: FilesService
    ) {}

    async getAllPatients(
        query: GetMultipleObjectsDto,
        clinicId: ObjectId
    ): Promise<ObjectList<PatientDocument>> {
        try {
            const filter = {
                ...(query.search
                    ? {
                          $or: [
                              { name: { $regex: query.search, $options: "i" } },
                              {
                                  patientId: {
                                      $regex: query.search,
                                      $options: "i",
                                  },
                              },
                          ],
                      }
                    : {}),

                clinic: clinicId,
            };
            const [data, count] = await Promise.all([
                this.patientModel
                    .find(filter)
                    .skip(query.skip)
                    .limit(query.limit)
                    .exec(),
                this.patientModel.find(filter).countDocuments(),
            ]);
            return { data, count };
        } catch (error) {
            console.log("error", error);
            throw new InternalServerErrorException("Something went wrong.");
        }
    }

    async getPatient(
        _id: ObjectId,
        clinciId: ObjectId
    ): Promise<PatientDocument> {
        try {
            const patient = await this.patientModel.findOne({
                _id,
                clinic: clinciId,
            });

            if (!patient) {
                throw new NotFoundException("Patient not found.");
            }
            return patient;
        } catch (error) {
            console.log("error", error);
            throw new InternalServerErrorException("Something went wrong.");
        }
    }

    async createPatient(data: CreatePatientDto, clinicId: ObjectId) {
        try {
            const patientId = nanoid();

            const patient = await this.patientModel.create({
                ...data,
                patientId,
                clinic: clinicId,
            });
            const patientData = {
                patientId: patientId,
                _id: patient._id,
                name: patient.name,
                clinicId: patient.clinic,
            };

            const jsonData = JSON.stringify(patientData);
            const buffer = await QRCode.toBuffer(jsonData, {
                color: {
                    dark: "#000",
                    light: "#FFF",
                },
            });
            const imagedata = (await this.filesService.uploadFile(
                {
                    originalname: patient.patientId,
                    mimetype: "image/jpeg",
                    buffer: buffer,
                },
                clinicId,
                FilePurpose.PATIENT_EMR
            )) as { url: string; presignedUrl: string };

            patient.qrCodeUrl = imagedata.url;
            await patient.save();

            return patient;
        } catch (error) {
            console.log("error", error);

            throw new InternalServerErrorException("Something went wrong.");
        }
    }

    async updatePatient(
        _id: ObjectId,
        data: UpdatePatientDto,
        clinicId: ObjectId
    ): Promise<PatientDocument> {
        try {
            const patient = await this.patientModel.findOne({
                _id,
                clinic: clinicId,
            });
            if (!patient) {
                throw new NotFoundException("Patient Not Found.");
            }

            Object.keys(data).map((key: string) => {
                patient[key] = data[key];
            });
            await patient.save();

            return patient;
        } catch (error) {
            console.log("error", error);
            throw new InternalServerErrorException("Something went wrong.");
        }
    }

    async deletePatient(_id: ObjectId): Promise<object> {
        try {
            const deletedPatient =
                await this.patientModel.findByIdAndDelete(_id);
            if (deletedPatient) {
                return { message: "Deleted successfully", count: 1 };
            } else {
                throw new NotFoundException("Patient Not Found.");
            }
        } catch (error) {
            console.log("error", error);
            throw new InternalServerErrorException("Something went wrong.");
        }
    }
}
