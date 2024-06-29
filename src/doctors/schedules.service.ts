import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ClinicsService } from "src/clinics/clinics.service";
import { Schedule, ScheduleDocument } from "./schemas/schedule.schema";
import { DoctorsService } from "./doctors.service";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { ObjectId } from "src/shared/typings";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { Types } from "mongoose";

@Injectable()
export class SchedulesService {
    constructor(
        @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
        private clinicsService: ClinicsService,
        private doctorsService: DoctorsService
    ) {}

    private async createSchedules(
        schedules: Array<CreateScheduleDto>,
        clinic: ObjectId
    ): Promise<Array<ScheduleDocument>> {
        return this.scheduleModel.insertMany(
            schedules.map((schedule) => ({
                ...schedule,
                doctor: new Types.ObjectId(schedule.doctor),
                clinic: new Types.ObjectId(clinic),
            }))
        );
    }

    async createDoctorSchedule(
        createScheduleDto: CreateScheduleDto,
        clinic: ObjectId
    ): Promise<ScheduleDocument> {
        await this.clinicsService.get(clinic);
        await this.doctorsService.getOne(createScheduleDto.doctor, clinic);

        // TODO: Check schedule is even valid or is overlapping for the same doctor etc.
        const schedule = new this.scheduleModel({
            ...createScheduleDto,
            clinic,
        });
        return schedule.save();
    }

    async updateDoctorSchedule(
        scheduleId: ObjectId,
        dto: UpdateScheduleDto,
        clinic: ObjectId
    ): Promise<ScheduleDocument> {
        const schedule = await this.scheduleModel.findOne({
            _id: scheduleId,
            clinic,
        });
        if (!schedule) throw new NotFoundException("Schedule not found");

        Object.keys(dto).forEach((key) => {
            schedule[key] = dto[key];
        });
        return await schedule.save();
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
}
