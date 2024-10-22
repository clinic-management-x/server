import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Appointment, AppointmentDocument } from "./schemas/appointment.schema";
import mongoose, { Model } from "mongoose";
import { CreateAppointmentDto } from "./dtos/create-appointment.dto";
import { ObjectId } from "src/shared/typings";
import { UpdateAppointmentDto } from "./dtos/update-appointment.dto";
import { GetMultipleObjectsDto } from "src/shared/dto/get-info.dto";
import { FilesService } from "src/files/files.service";
import { GetBookedAppointmentDto } from "./dtos/get-booked-appointment.dto";
import * as dayjs from "dayjs";

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name)
        private appointmentModel: Model<Appointment>,
        private filesService: FilesService
    ) {}

    async getAppointments(query: GetMultipleObjectsDto, clinicId: ObjectId) {
        try {
            const pouplateFilterQuery = [];
            const searchData = query.search
                ? await this.appointmentModel.aggregate([
                      {
                          $match: {
                              clinicId: clinicId,
                          },
                      },
                      {
                          $lookup: {
                              from: "patients",
                              localField: "patient",
                              foreignField: "_id",
                              as: "patient",
                          },
                      },
                      { $unwind: "$patient" },
                      {
                          $lookup: {
                              from: "doctors",
                              localField: "doctor",
                              foreignField: "_id",
                              as: "doctor",
                          },
                      },
                      { $unwind: "$doctor" },
                      {
                          $lookup: {
                              from: "specialities",
                              localField: "doctor.speciality",
                              foreignField: "_id",
                              as: "doctor.speciality",
                          },
                      },
                      { $unwind: "$doctor.speciality" },
                      {
                          $match: {
                              $or: [
                                  {
                                      "patient.patientId": {
                                          $regex: query.search,
                                          $options: "i",
                                      },
                                  },
                                  {
                                      "patient.name": {
                                          $regex: query.search,
                                          $options: "i",
                                      },
                                  },
                                  {
                                      "doctor.name": {
                                          $regex: query.search,
                                          $options: "i",
                                      },
                                  },
                              ],
                          },
                      },
                      {
                          $project: {
                              _id: 1,
                              "patient._id": 1,
                              "patient.patientId": 1,
                              "patient.name": 1,
                              "doctor._id": 1,
                              "doctor.name": 1,
                              "doctor.avatarUrl": 1,
                              "doctor.speciality._id": 1,
                              "doctor.speciality.name": 1,
                              appointmentDateAndTime: 1,
                              necessity: 1,
                              status: 1,
                              clinicId: 1,
                              createdAt: 1,
                              updatedAt: 1,
                              __v: 1,
                          },
                      },
                  ])
                : [];

            const [data, count] = await Promise.all([
                this.appointmentModel
                    .find({ clinicId })
                    .populate([
                        {
                            path: "patient",

                            select: "_id name patientId",
                        },
                        {
                            path: "doctor",
                            select: "_id name avatarUrl",
                            populate: {
                                path: "speciality",
                                select: "_id name",
                            },
                        },
                    ])
                    .skip(query.skip)
                    .limit(query.limit)
                    .exec(),
                this.appointmentModel
                    .find({ clinicId })
                    .populate(pouplateFilterQuery)
                    .countDocuments(),
            ]);
            const newData = query.search
                ? await Promise.all(
                      searchData.map(async (appointment) => {
                          if (appointment.doctor.avatarUrl) {
                              const presignedUrl =
                                  await this.filesService.createPresignedUrl(
                                      appointment.doctor.avatarUrl
                                  );

                              appointment.doctor.avatarUrl = presignedUrl;
                          }
                          return appointment;
                      })
                  )
                : await Promise.all(
                      data.map(async (appointment) => {
                          if (appointment.doctor.avatarUrl) {
                              const presignedUrl =
                                  await this.filesService.createPresignedUrl(
                                      appointment.doctor.avatarUrl
                                  );

                              appointment.doctor.avatarUrl = presignedUrl;
                          }
                          return appointment;
                      })
                  );
            return { data: newData, count: query.search ? 1 : count };
        } catch (error) {
            console.log("error", error);
            throw new InternalServerErrorException("Something went wrong.");
        }
    }

    async getBookedAppointments(
        data: GetBookedAppointmentDto,
        clinicId: ObjectId
    ) {
        const appointmentDate = dayjs(data.appointmentDate);
        const startOfDay = appointmentDate.startOf("day").toISOString();
        const endOfDay = appointmentDate.endOf("day").toISOString();

        const bookedAppointments = await this.appointmentModel.find({
            clinicId: clinicId,
            _id: {
                $ne: data._id,
            },
            doctor: data.doctor,
            appointmentDate: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        });
        return bookedAppointments;
    }

    async createAppointment(
        data: CreateAppointmentDto,
        clinicId: ObjectId
    ): Promise<AppointmentDocument> {
        try {
            const appointment = await this.appointmentModel.create({
                ...data,
                clinicId,
            });
            return appointment;
        } catch (error) {
            console.log("error", error);
            throw new InternalServerErrorException("Something went wrong.");
        }
    }

    async updateAppointment(
        _id: ObjectId,
        data: UpdateAppointmentDto,
        clinicId: ObjectId
    ): Promise<AppointmentDocument> {
        try {
            const appointmentToUpdate = await this.appointmentModel.findById({
                _id,
                clinicId,
            });
            if (!appointmentToUpdate)
                throw new NotFoundException("Appointment Not Found.");

            Object.keys(data).map((key) => {
                appointmentToUpdate[key] = data[key];
            });
            await appointmentToUpdate.save();
            return appointmentToUpdate;
        } catch (error) {
            console.log("error", error);
            throw new InternalServerErrorException("Something went wrong.");
        }
    }

    async deleteAppointments(
        data: string[],
        clinicId: ObjectId
    ): Promise<object> {
        try {
            const appointmentIds = data.map(
                (id) => new mongoose.Types.ObjectId(id)
            );

            const appointmentsDeleted = await this.appointmentModel.deleteMany({
                _id: { $in: appointmentIds },
                clinicId,
            });
            if (appointmentsDeleted) {
                return appointmentsDeleted;
            }
        } catch (error) {
            console.log("error", error);
            throw new InternalServerErrorException("Something went wrong.");
        }
    }

    async deleteAppointment(_id: ObjectId): Promise<object> {
        try {
            const deletedAppointment =
                await this.appointmentModel.findByIdAndDelete(_id);
            if (deletedAppointment) {
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
