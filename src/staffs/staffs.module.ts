import { Module } from "@nestjs/common";
import { StaffsService } from "./staffs.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Staff, StaffSchema } from "./schemas/staff.schema";
import { StaffsController } from "./staffs.controller";
import { FilesModule } from "src/files/files.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
        FilesModule,
    ],
    controllers: [StaffsController],
    providers: [StaffsService],
})
export class StaffsModule {}
