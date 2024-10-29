import { Module } from "@nestjs/common";
import { AppointmentsController } from "./appointments.controller";
import { AppointmentsService } from "./appointments.service";
import { Appointment, AppointmentSchema } from "./schemas/appointment.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { ClinicsModule } from "src/clinics/clinics.module";
import { FilesModule } from "src/files/files.module";
import { Doctor, DoctorSchema } from "src/doctors/schemas/doctor.schema";
import { Schedule, ScheduleSchema } from "src/doctors/schemas/schedule.schema";

@Module({
    imports: [
        ClinicsModule,
        MongooseModule.forFeature([
            { name: Appointment.name, schema: AppointmentSchema },
            { name: Doctor.name, schema: DoctorSchema },
            { name: Schedule.name, schema: ScheduleSchema },
        ]),
        FilesModule,
    ],
    controllers: [AppointmentsController],
    providers: [AppointmentsService],
})
export class AppointmentsModule {}
