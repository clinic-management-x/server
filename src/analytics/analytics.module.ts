import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { ClinicsModule } from "src/clinics/clinics.module";
import { MongooseModule } from "@nestjs/mongoose";
import {
    Appointment,
    AppointmentSchema,
} from "src/appointments/schemas/appointment.schema";
import { Doctor, DoctorSchema } from "src/doctors/schemas/doctor.schema";
import { Order, OrderSchema } from "src/orders/schemas/order.schema";
import {
    Supplier,
    SupplierSchema,
} from "src/suppliers/schemas/supplier.schema";

@Module({
    imports: [
        ClinicsModule,
        MongooseModule.forFeature([
            { name: Appointment.name, schema: AppointmentSchema },
            { name: Doctor.name, schema: DoctorSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Supplier.name, schema: SupplierSchema },
        ]),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule {}
