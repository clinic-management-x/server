import { Module } from "@nestjs/common";
import { AppointmentsController } from "./appointments.controller";
import { AppointmentsService } from "./appointments.service";
import { Appointment, AppointmentSchema } from "./schemas/appointment.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { ClinicsModule } from "src/clinics/clinics.module";
import { FilesModule } from "src/files/files.module";

@Module({
    imports: [
        ClinicsModule,
        MongooseModule.forFeature([
            { name: Appointment.name, schema: AppointmentSchema },
        ]),
        FilesModule,
    ],
    controllers: [AppointmentsController],
    providers: [AppointmentsService],
})
export class AppointmentsModule {}
