import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ClinicsService } from "src/clinics/clinics.service";
import { Schedule } from "./schemas/schedule.schema";
import { DoctorsService } from "./doctors.service";

@Injectable()
export class SchedulesService {
    constructor(
        @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
        private clinicsService: ClinicsService,
        private doctorsService: DoctorsService
    ) {}
}
