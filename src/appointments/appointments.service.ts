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
import { FilesService } from "src/files/files.service";
import { GetBookedAppointmentDto } from "./dtos/get-booked-appointment.dto";
import * as dayjs from "dayjs";
import { GetAppointmentsDto } from "./dtos/get-appointments.dto";

const oneHourAgo = new Date();
@Injectable()
export class AppointmentsService {
    constructor(
        @InjectModel(Appointment.name)
        private appointmentModel: Model<Appointment>,
        private filesService: FilesService
    ) {}

    async getAppointments(query: GetAppointmentsDto, clinicId: ObjectId) {
        try {
            const {
                search,
                limit,
                skip,
                start,
                end,
                status,
                nearest,
                necessity,
            } = query;

            let baseFilter = { clinicId: clinicId };

            const sortQuery: { [key: string]: 1 | -1 } =
                nearest === "true"
                    ? { appointmentDate: 1 }
                    : {
                          createdAt: -1,
                      };

            baseFilter = {
                ...baseFilter,
                ...(status && { status }),
                ...(start &&
                    end && {
                        appointmentDate: {
                            $gte: start,
                            $lte: end,
                        },
                    }),
                ...(nearest && { appointmentStartTime: { $gte: oneHourAgo } }),
                ...(necessity && { necessity }),
            };

            const pouplateFilterQuery = [];
            const searchData = query.search
                ? await this.appointmentModel.aggregate([
                      {
                          $match: baseFilter,
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
                                          $regex: search,
                                          $options: "i",
                                      },
                                  },
                                  {
                                      "patient.name": {
                                          $regex: search,
                                          $options: "i",
                                      },
                                  },
                                  {
                                      "doctor.name": {
                                          $regex: search,
                                          $options: "i",
                                      },
                                  },
                              ],
                          },
                      },
                      {
                          $sort: sortQuery,
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
                              appointmentDate: 1,
                              appointmentStartTime: 1,
                              appointmentEndTime: 1,
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
                    .find(baseFilter)
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
                    .sort(sortQuery)
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                this.appointmentModel
                    .find(baseFilter)
                    .populate(pouplateFilterQuery)
                    .countDocuments(),
            ]);
            const newData = search
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
            return { data: newData, count: search ? 1 : count };
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
