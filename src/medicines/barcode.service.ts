import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BarCode, ScanHistory } from "./schemas/barcode.schema";
import { Model } from "mongoose";
import { FilesService } from "src/files/files.service";

import { ObjectId } from "src/shared/typings";
import { CreateBarcodeDto } from "./dto/barcode-dto";

@Injectable()
export class BarCodeService {
    constructor(
        @InjectModel(BarCode.name)
        private barCodeModel: Model<BarCode>,
        @InjectModel(ScanHistory.name)
        private scanModel: Model<ScanHistory>,
        private filesService: FilesService
    ) {}

    async createBarCodes(
        createBarcodeDto: CreateBarcodeDto[],
        clinicId: ObjectId
    ): Promise<object[]> {
        const dataArr = createBarcodeDto.map((data) => {
            return { ...data, clinic: clinicId };
        });
        const barcodes = await Promise.all(
            await this.barCodeModel.insertMany(dataArr)
        );

        return barcodes;
    }
}
