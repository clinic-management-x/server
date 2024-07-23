import { Injectable, NotFoundException } from "@nestjs/common";
import { Staff, StaffDocument } from "./schemas/staff.schema";
import { Model } from "mongoose";
import { CreateStaffDto } from "./dto/create-staff.dto";
import { ObjectId, ObjectList } from "src/shared/typings";
import { FilesService } from "src/files/files.service";
import { InjectModel } from "@nestjs/mongoose";
import { UpdateStaffDto } from "./dto/update-staff.dto";
import { GetStaffsDto } from "./dto/get-staffs.dto";

@Injectable()
export class StaffsService {
    constructor(
        @InjectModel(Staff.name) private staffModel: Model<Staff>,
        private filesService: FilesService
    ) {}

    async findStaffs(
        query: GetStaffsDto,
        clinicId: ObjectId
    ): Promise<ObjectList<StaffDocument>> {
        const filter = {
            ...(query.search
                ? { name: { $regex: query.search, $options: "i" } }
                : {}),

            clinic: clinicId,
        };
        const [data, count] = await Promise.all([
            this.staffModel
                .find(filter)
                .skip(query.skip)
                .limit(query.limit)
                .exec(),
            this.staffModel.find(filter).countDocuments(),
        ]);

        await Promise.all(
            data.map(async (staff) => {
                if (staff.avatarUrl) {
                    const presignedUrl =
                        await this.filesService.createPresignedUrl(
                            staff.avatarUrl
                        );
                    return (staff.avatarUrl = presignedUrl);
                }
            })
        );

        return { data, count };
    }

    async findStaff(_id: ObjectId, clinicId: ObjectId): Promise<StaffDocument> {
        const staff = await this.staffModel.findOne({ _id, clinic: clinicId });
        if (staff.avatarUrl) {
            staff.avatarUrl = await this.filesService.createPresignedUrl(
                staff.avatarUrl
            );
        }
        if (!staff) throw new NotFoundException("Staff Not Found");
        return staff;
    }
    async create(
        data: CreateStaffDto,
        clinicId: ObjectId
    ): Promise<StaffDocument> {
        const s3AvatarUrl = data.avatarUrl;

        if (s3AvatarUrl) {
            await this.filesService.checkFilesByUrls([s3AvatarUrl], clinicId);
        }
        const staff = new this.staffModel({
            ...data,
            clinic: clinicId,
        });

        const createdStaff = await staff.save();

        return createdStaff;
    }

    async update(
        _id: ObjectId,
        data: UpdateStaffDto,
        clinicId: ObjectId
    ): Promise<StaffDocument> {
        const staff = await this.staffModel.findOne({ _id, clinic: clinicId });
        if (!staff) throw new NotFoundException("Staff Not Found");

        const s3AvatarUrl = data.avatarUrl;
        if (s3AvatarUrl) {
            await this.filesService.checkFilesByUrls([s3AvatarUrl], clinicId);
        }

        Object.keys(data).forEach((key) => {
            staff[key] = data[key];
        });
        const updatedStaff = await staff.save();

        return updatedStaff;
    }

    async delete(_id: ObjectId, clinicId: ObjectId): Promise<object> {
        const staff = await this.staffModel.findOne({ _id, clinic: clinicId });
        if (!staff) throw new NotFoundException("Staff Not Found");

        await this.staffModel.deleteOne({ _id }).exec();
        if (staff.avatarUrl) {
            await this.filesService.deleteFiles([staff.avatarUrl]);
        }
        return { deletedCount: 1 };
    }
}
