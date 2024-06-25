import { Module } from "@nestjs/common";
import { DoctorsController } from "./doctors.controller";
import { DoctorsService } from "./doctors.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Doctor, DoctorSchema } from "./schemas/doctor.schema";
import { Speciality, SpecialitySchema } from "./schemas/speciality.schema";
import { Schedule, ScheduleSchema } from "./schemas/schedule.schema";
import { ClinicsModule } from "src/clinics/clinics.module";

@Module({
    imports: [
        ClinicsModule,
        MongooseModule.forFeature([
            { name: Doctor.name, schema: DoctorSchema },
            { name: Speciality.name, schema: SpecialitySchema },
            { name: Schedule.name, schema: ScheduleSchema },
        ]),
    ],
    controllers: [DoctorsController],
    providers: [DoctorsService],
})
export class DoctorsModule {}
