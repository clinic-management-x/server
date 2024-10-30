import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Appointment } from "src/appointments/schemas/appointment.schema";
import { Doctor } from "src/doctors/schemas/doctor.schema";
import { Order } from "src/orders/schemas/order.schema";
import { Supplier } from "src/suppliers/schemas/supplier.schema";
import { GetAnalyticsDto } from "./dtos/get-analytics.dto";
import { ObjectId } from "src/shared/typings";
import * as dayjs from "dayjs";
import { months } from "src/shared/months";

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(Appointment.name)
        private appointmentModel: Model<Appointment>,
        @InjectModel(Doctor.name)
        private doctorModel: Model<Doctor>,
        @InjectModel(Order.name)
        private orderModel: Model<Order>,
        @InjectModel(Supplier.name)
        private supplierModel: Model<Supplier>
    ) {}

    getAnalyticsData = async (data: GetAnalyticsDto, clinicId: ObjectId) => {
        try {
            const isYear =
                dayjs(data.start).get("month") === 0 &&
                dayjs(data.end).get("month") === 11;

            const [
                doctorsByAppointmentData,
                appointmentByDateData,
                supplierByOrderData,
                orderByDateData,
            ] = await Promise.all([
                await this.appointmentModel.aggregate([
                    {
                        $match: {
                            clinicId: clinicId,
                            appointmentDate: {
                                $gte: new Date(data.start),
                                $lte: new Date(data.end),
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "doctors",
                            localField: "doctor",
                            foreignField: "_id",
                            as: "doctorInfo",
                        },
                    },
                    {
                        $unwind: "$doctorInfo",
                    },
                    {
                        $group: {
                            _id: "$doctorInfo.name",
                            count: { $sum: 1 },
                        },
                    },
                ]),
                await this.appointmentModel.aggregate([
                    {
                        $match: {
                            clinicId: clinicId,
                            appointmentDate: {
                                $gte: new Date(data.start),
                                $lte: new Date(data.end),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: isYear ? "%b" : "%d %b",
                                    date: "$appointmentDate",
                                },
                            },
                            count: { $sum: 1 },
                        },
                    },
                ]),
                await this.orderModel.aggregate([
                    {
                        $match: {
                            clinic: clinicId,
                            createdAt: {
                                $gte: new Date(data.start),
                                $lte: new Date(data.end),
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "suppliers",
                            localField: "supplier",
                            foreignField: "_id",
                            as: "supplierInfo",
                        },
                    },
                    {
                        $unwind: "$supplierInfo",
                    },
                    {
                        $group: {
                            _id: "$supplierInfo.name",
                            count: { $sum: 1 },
                        },
                    },
                ]),
                await this.orderModel.aggregate([
                    {
                        $match: {
                            clinic: clinicId,
                            createdAt: {
                                $gte: new Date(data.start),
                                $lte: new Date(data.end),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    format: isYear ? "%b" : "%d %b",
                                    date: "$createdAt",
                                },
                            },
                            count: { $sum: 1 },
                        },
                    },
                ]),
            ]);
            const doctorsByAppointment = {
                labels: doctorsByAppointmentData.map((idata) => idata._id),
                dataArr: doctorsByAppointmentData.map((idata) => idata.count),
            };

            const month = dayjs(data.start).get("month");
            const totalDays = dayjs(data.start).daysInMonth();

            const appointmentByDate = this.generateTimeArray(
                appointmentByDateData,
                month,
                totalDays,
                isYear
            );

            const suppliersByOrder = {
                labels: supplierByOrderData.map((idata) => idata._id),
                dataArr: supplierByOrderData.map((idata) => idata.count),
            };

            const ordersByDate = this.generateTimeArray(
                orderByDateData,
                month,
                totalDays,
                isYear
            );

            return {
                doctorsByAppointment,
                appointmentByDate,
                suppliersByOrder,
                ordersByDate,
            };
        } catch (error) {
            throw new InternalServerErrorException(
                "Something went wrong on the server side"
            );
        }
    };

    generateTimeArray = (
        data: { _id: string; count: number }[],
        month: number,
        totalDays: number,
        isYear: boolean
    ) => {
        const modifiedArr = isYear
            ? months.map((month) => {
                  const hasAppointment = data.find(
                      (idata) => idata._id === month
                  );
                  return {
                      _id: month,
                      count: hasAppointment ? hasAppointment.count : 0,
                  };
              })
            : Array.from({
                  length: totalDays,
              }).map((day, index) => {
                  const current = dayjs()
                      .set("date", index + 1)
                      .set("month", month)
                      .format("DD MMM");
                  const hasAppointment = data.find(
                      (idata) => idata._id === current
                  );
                  return {
                      _id: current,
                      count: hasAppointment ? hasAppointment.count : 0,
                  };
              });

        const result = {
            labels: modifiedArr.map((idata) => idata._id),
            dataArr: modifiedArr.map((idata) => idata.count),
        };
        return result;
    };
}
