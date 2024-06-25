import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Clinic, ClinicSchema } from "./schemas/clinic.schema";
import { ClinicsService } from "./clinics.service";
import { ClinicsController } from "./clinics.controller";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Clinic.name, schema: ClinicSchema },
        ]),
    ],
    providers: [ClinicsService],
    exports: [ClinicsService],
    controllers: [ClinicsController],
})
export class ClinicsModule {}
