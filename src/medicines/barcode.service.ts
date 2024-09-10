import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BarCode, ScanHistory } from "./schemas/barcode.schema";
import { Model } from "mongoose";
import { FilesService } from "src/files/files.service";
import bwipjs from "bwip-js";
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
        const generatedBarcodes = new Set();

        const generateUniqueBarcode = () => {
            let barcode;
            do {
                barcode = Math.floor(
                    1000000000 + Math.random() * 9000000000
                ).toString(); // Generates a random 10-digit number
            } while (generatedBarcodes.has(barcode)); // Check if the barcode is already generated

            generatedBarcodes.add(barcode); // Add the barcode to the Set
            return `${barcode}`;
        };

        const dataArr = await Promise.all(
            createBarcodeDto.map(async (data) => {
                // const buffer = await bwipjs.toBuffer({
                //     bcid: "code128",
                //     text: data.batchId,
                //     scale: 3,
                //     height: 10,
                //     includetext: true,
                //     textxalign: "center",
                // });
                // const barcodeBase64 = `data:image/gif;base64,${buffer.toString("base64")}`;

                return {
                    ...data,
                    clinic: clinicId,
                    //barCodeUrl: barcodeBase64,
                    barcode: generateUniqueBarcode(),
                };
            })
        );
        console.log("dataArr", dataArr);
        const barcodes = await Promise.all(
            await this.barCodeModel.insertMany(dataArr)
        );

        return barcodes;
    }

    // Function to generate a random barcode number
}
