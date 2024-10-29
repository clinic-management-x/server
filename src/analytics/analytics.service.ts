import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Appointment } from "src/appointments/schemas/appointment.schema";
import { Doctor } from "src/doctors/schemas/doctor.schema";
import { Order } from "src/orders/schemas/order.schema";
import { Supplier } from "src/suppliers/schemas/supplier.schema";
import { GetAnalyticsDto } from "./dtos/get-analytics.dto";
import { ObjectId } from "src/shared/typings";

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
                            _id: "$appointmentDate",
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
                            _id: "$createdAt",
                            count: { $sum: 1 },
                        },
                    },
                ]),
            ]);
            const doctorsByAppointment = {
                labels: doctorsByAppointmentData.map((idata) => idata._id),
                dataArr: doctorsByAppointmentData.map((idata) => idata.count),
            };

            const appointmentByDate = {
                labels: appointmentByDateData.map((idata) => idata._id),
                dataArr: appointmentByDateData.map((idata) => idata.count),
            };

            const suppliersByOrder = {
                labels: supplierByOrderData.map((idata) => idata._id),
                dataArr: supplierByOrderData.map((idata) => idata.count),
            };

            const ordersByDate = {
                labels: orderByDateData.map((idata) => idata._id),
                dataArr: orderByDateData.map((idata) => idata.count),
            };

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
}
