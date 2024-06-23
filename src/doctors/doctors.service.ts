import { Injectable } from "@nestjs/common";
import { GetDoctorsDto } from "./dto/get-doctors.dto";
import { Doctor } from "./schemas/doctor.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateDoctorDto } from "./dto/create-doctor-dto";
import { Speciality } from "./schemas/speciality.schema";

@Injectable()
export class DoctorsService {
    constructor(
        @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
        @InjectModel(Speciality.name) private specialityModel: Model<Speciality>
    ) {}

    async getAll(query: GetDoctorsDto): Promise<Array<Doctor>> {
        return this.doctorModel.find().skip(query.skip).limit(query.limit);
    }

    async createDoctor(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
        const speciality = await this.specialityModel.findOne({
            _id: createDoctorDto.speciality,
        });
        if (!speciality) throw new Error("Speciality Not Found");

        const doctor = new this.doctorModel(createDoctorDto);
        return doctor.save();
    }

    async getSpecialities(): Promise<Array<Speciality>> {
        return this.specialityModel.find().limit(0);
    }
}
