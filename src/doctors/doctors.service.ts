import { Injectable, NotFoundException } from "@nestjs/common";
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

@Injectable()
export class DoctorsService {
    constructor(
        @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
        @InjectModel(Speciality.name)
        private specialityModel: Model<Speciality>,
        private clinicService: ClinicsService,
        private filesService: FilesService
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
        return { data, count };
    }

    async getOne(_id: ObjectId, clinic: ObjectId): Promise<DoctorDocument> {
        const doctor = await this.doctorModel
            .findOne({ _id, clinic })
            .populate("speciality")
            .exec();
        if (!doctor) throw new NotFoundException("Doctor not found");
        return doctor;
    }

    async createDoctor(
        createDoctorDto: CreateDoctorDto,
        clinicId: ObjectId
    ): Promise<DoctorDocument> {
        const speciality = await this.specialityModel.findOne({
            _id: createDoctorDto.speciality,
        });
        if (!speciality) throw new NotFoundException("Speciality Not Found");

        await this.clinicService.get(clinicId);

        const s3AvatarUrl = createDoctorDto.avatarUrl;
        if (s3AvatarUrl) {
            await this.filesService.checkFilesByUrls([s3AvatarUrl], clinicId);
        }

        const doctor = new this.doctorModel({
            ...createDoctorDto,
            clinic: clinicId,
        });

        // TODO : We can directly generate user for this doctor?
        return doctor.save();
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

    async getSpecialities(): Promise<Array<SpecialityDocument>> {
        return this.specialityModel.find().limit(0);
    }
}
