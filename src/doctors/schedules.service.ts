import {
    ConflictException,
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
import * as R from "ramda";

@Injectable()
export class SchedulesService {
    constructor(
        @InjectModel(Schedule.name) private scheduleModel: Model<Schedule>,
        private clinicsService: ClinicsService,
        @Inject(forwardRef(() => DoctorsService))
        private doctorsService: DoctorsService
    ) {}

    async createSchedules(
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

        const existingSchedules = await this.getDoctorSchedules(
            data.doctor
        ).then(
            R.map(
                (schedule): ScheduleDto => ({
                    start: schedule.start,
                    end: schedule.end,
                })
            )
        );

        if (
            this.areSchedulesOverlapping(
                existingSchedules.concat(data.schedules)
            )
        ) {
            throw new ConflictException("Schedules overlap");
        }

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

        const existingSchedules = await this.getDoctorSchedules(
            schedule.doctor
        ).then(
            R.map((scheduleObj): ScheduleDto => {
                if (scheduleObj._id.toString() === schedule._id.toString()) {
                    return dto;
                }
                return { start: scheduleObj.start, end: scheduleObj.end };
            })
        );

        if (this.areSchedulesOverlapping(existingSchedules)) {
            throw new ConflictException("Schedules overlap");
        }

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

    async deleteDoctorSchedules(doctor: ObjectId): Promise<object> {
        return this.scheduleModel.deleteMany({ doctor }).exec();
    }

    areSchedulesOverlapping(schedules: Array<ScheduleDto>): boolean {
        // Remove empty schedules
        const emptySchedule = schedules.find(
            (schedule) => schedule.start === schedule.end
        );
        if (emptySchedule) return true;

        // Should have at most 1 boundary schedule
        const boundaries = schedules.filter(
            (schedule) => schedule.start > schedule.end
        );
        if (boundaries.length > 1) return true;

        // Make schedules ascending by start
        schedules.sort((x, y) => {
            return x.start < y.start ? -1 : 1;
        });

        let current = schedules[0];
        for (let i = 1; i < schedules.length; i++) {
            const schedule = schedules[i];
            if (schedule.start < current.end) return true;
            current = schedule;
        }

        if (boundaries.length > 0 && schedules[0].start < current.end)
            return true;

        return false;
    }
}
