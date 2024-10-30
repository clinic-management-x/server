import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Clinic, ClinicSchema } from "./schemas/clinic.schema";
import { ClinicsService } from "./clinics.service";
import { ClinicsController } from "./clinics.controller";
import { User, UserSchema } from "src/users/schemas/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Clinic.name, schema: ClinicSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    providers: [ClinicsService],
    exports: [ClinicsService],
    controllers: [ClinicsController],
})
export class ClinicsModule {}
