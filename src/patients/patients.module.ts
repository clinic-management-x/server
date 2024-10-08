import { Module } from "@nestjs/common";
import { PatientsController } from "./patients.controller";
import { PatientsService } from "./patients.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Patient, PatientSchema } from "./schemas/patient.schema";
import { FilesModule } from "src/files/files.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Patient.name, schema: PatientSchema },
        ]),
        FilesModule,
    ],
    controllers: [PatientsController],
    providers: [PatientsService],
})
export class PatientsModule {}
