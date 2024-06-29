import {
    Inject,
    Injectable,
    NotFoundException,
    forwardRef,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ClinicsService } from "src/clinics/clinics.service";
import { Schedule, ScheduleDocument } from "./schemas/schedule.schema";
import { DoctorsService } from "./doctors.service";
import { CreateScheduleDto, ScheduleDto } from "./dto/create-schedule.dto";
import { ObjectId } from "src/shared/typings";
import { Types } from "mongoose";

@Injectable()
export class SchedulesService {
    constructor(
        @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
        private clinicsService: ClinicsService,
        @Inject(forwardRef(() => DoctorsService))
        private doctorsService: DoctorsService
    ) {}

    private async createSchedules(
        schedules: Array<ScheduleDto>,
        doctor: ObjectId,
        clinic: ObjectId
    ): Promise<Array<ScheduleDocument>> {
        return this.scheduleModel.insertMany(
            schedules.map((schedule) => ({
                ...schedule,
                doctor: new Types.ObjectId(doctor),
                clinic: new Types.ObjectId(clinic),
            }))
        );
    }

    async createDoctorSchedules(
        data: CreateScheduleDto,
        clinic: ObjectId
    ): Promise<Array<ScheduleDocument>> {
        await this.clinicsService.get(clinic);
        await this.doctorsService.get(data.doctor, clinic);
        // TODO: Check schedule is even valid or is overlapping for the same doctor etc.
        return this.createSchedules(data.schedules, data.doctor, clinic);
    }

    async updateDoctorSchedule(
        _id: ObjectId,
        dto: ScheduleDto,
        clinic: ObjectId
    ): Promise<ScheduleDocument> {
        const schedule = await this.scheduleModel.findOne({
            _id,
            clinic,
        });
        if (!schedule) throw new NotFoundException("Schedule not found");

        Object.keys(dto).forEach((key) => {
            schedule[key] = dto[key];
        });
        return schedule.save();
    }

    async deleteDoctorSchedule(
        scheduleId: ObjectId,
        clinic: ObjectId
    ): Promise<object> {
        const { deletedCount } = await this.scheduleModel.deleteOne({
            _id: scheduleId,
            clinic,
        });
        if (deletedCount === 0)
            throw new NotFoundException("Schedule not found");
        return { deletedCount };
    }

    async getDoctorSchedules(
        doctor: ObjectId
    ): Promise<Array<ScheduleDocument>> {
        return this.scheduleModel.find({ doctor }).exec();
    }
}
