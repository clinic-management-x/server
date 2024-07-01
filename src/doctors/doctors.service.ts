import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
    forwardRef,
} from "@nestjs/common";
import { GetDoctorsDto } from "./dto/get-doctors.dto";
import { Doctor, DoctorDocument } from "./schemas/doctor.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { Speciality, SpecialityDocument } from "./schemas/speciality.schema";
import { UpdateDoctorDetailsDto } from "./dto/update-doctor-details.dto";
import { ClinicsService } from "src/clinics/clinics.service";
import { ObjectList, ObjectId } from "src/shared/typings";
import { FilesService } from "src/files/files.service";
import { SchedulesService } from "./schedules.service";

@Injectable()
export class DoctorsService {
    constructor(
        @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
        @InjectModel(Speciality.name)
        private specialityModel: Model<Speciality>,
        private clinicService: ClinicsService,
        private filesService: FilesService,
        @Inject(forwardRef(() => SchedulesService))
        private schedulesService: SchedulesService
    ) {}

    async getAll(
        query: GetDoctorsDto,
        clinic: ObjectId
    ): Promise<ObjectList<DoctorDocument>> {
        const filter = {
            ...(query.search
                ? { name: { $regex: query.search, $options: "i" } }
                : {}),
            ...(query.speciality ? { speciality: query.speciality } : {}),
            clinic,
        };

        const [data, count] = await Promise.all([
            this.doctorModel
                .find(filter)
                .skip(query.skip)
                .limit(query.limit)
                .populate("speciality")
                .exec(),
            this.doctorModel.find(filter).countDocuments(),
        ]);

        await Promise.all(
            data.map(async (doctor) => {
                if (doctor.avatarUrl) {
                    const presignedUrl =
                        await this.filesService.createPresignedUrl(
                            doctor.avatarUrl
                        );
                    return (doctor.avatarUrl = presignedUrl);
                }
            })
        );

        return { data, count };
    }

    async get(_id: ObjectId, clinic: ObjectId): Promise<DoctorDocument> {
        const doctor = await this.doctorModel.findOne({ _id, clinic }).exec();
        if (!doctor) throw new NotFoundException("Doctor not found");
        return doctor;
    }

    async getPopulated(_id: ObjectId, clinic: ObjectId): Promise<Object> {
        const doctor = await this.doctorModel
            .findOne({ _id, clinic })
            .populate("speciality")
            .exec();
        if (!doctor) throw new NotFoundException("Doctor not found");

        if (doctor.avatarUrl) {
            doctor.avatarUrl = await this.filesService.createPresignedUrl(
                doctor.avatarUrl
            );
        }

        const schedules = await this.schedulesService.getDoctorSchedules(_id);
        return { ...doctor.toObject(), schedules };
    }

    async createDoctor(
        data: CreateDoctorDto,
        clinicId: ObjectId
    ): Promise<DoctorDocument> {
        const speciality = await this.specialityModel.findOne({
            _id: data.speciality,
        });
        if (!speciality) throw new NotFoundException("Speciality Not Found");

        await this.clinicService.get(clinicId);

        const s3AvatarUrl = data.avatarUrl;
        if (s3AvatarUrl) {
            await this.filesService.checkFilesByUrls([s3AvatarUrl], clinicId);
        }

        if (
            data.schedules.length > 0 &&
            this.schedulesService.areSchedulesOverlapping(data.schedules)
        ) {
            throw new ConflictException("Schedules overlap");
        }

        const doctor = new this.doctorModel({
            ...data,
            clinic: clinicId,
        });

        // TODO : We can directly generate user for this doctor?
        const createdDoctor = await doctor.save();

        if (data.schedules.length > 0) {
            await this.schedulesService.createSchedules(
                data.schedules,
                doctor._id,
                clinicId
            );
        }

        return createdDoctor;
    }

    async updateDetails(
        _id: ObjectId,
        dto: UpdateDoctorDetailsDto,
        clinic: ObjectId
    ): Promise<DoctorDocument> {
        const doctor = await this.doctorModel.findOne({ _id, clinic });
        if (!doctor) throw new NotFoundException("Doctor Not Found");

        if (dto.speciality) {
            const speciality = await this.specialityModel.findOne({
                _id: dto.speciality,
            });
            if (!speciality)
                throw new NotFoundException("Speciality Not Found");
        }

        const s3AvatarUrl = dto.avatarUrl;
        if (s3AvatarUrl) {
            await this.filesService.checkFilesByUrls([s3AvatarUrl], clinic);
        }

        Object.keys(dto).forEach((key) => {
            doctor[key] = dto[key];
        });
        const updatedDoctor = await doctor.save();

        // Remove existing URL?
        if (
            s3AvatarUrl &&
            doctor.avatarUrl &&
            s3AvatarUrl !== doctor.avatarUrl
        ) {
            await this.filesService.deleteFiles([doctor.avatarUrl]);
        }

        return updatedDoctor;
    }

    async deleteDoctor(_id: ObjectId, clinic: ObjectId): Promise<Object> {
        const doctor = await this.doctorModel.findOne({
            _id,
            clinic,
        });
        if (!doctor) throw new NotFoundException("Doctor not found");

        await this.doctorModel.deleteOne({ _id }).exec();
        await this.schedulesService.deleteDoctorSchedules(_id);
        if (doctor.avatarUrl)
            await this.filesService.deleteFiles([doctor.avatarUrl]);

        return { deletedCount: 1 };
    }

    async getSpecialities(): Promise<Array<SpecialityDocument>> {
        return this.specialityModel.find().limit(0);
    }
}
