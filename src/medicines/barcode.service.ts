import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BarCode, ScanHistory } from "./schemas/barcode.schema";
import { Model } from "mongoose";
import { FilesService } from "src/files/files.service";
import { ObjectId } from "src/shared/typings";
import { CreateBarcodeDto } from "./dto/barcode-dto";
import * as bwipjs from "bwip-js";
import { FilePurpose } from "src/shared/shared.enum";
import { GetMedicinesDto } from "./dto/get-medicines.dto";
import { Order } from "src/orders/schemas/order.schema";

@Injectable()
export class BarCodeService {
    constructor(
        @InjectModel(BarCode.name)
        private barCodeModel: Model<BarCode>,
        @InjectModel(ScanHistory.name)
        private scanModel: Model<ScanHistory>,
        @InjectModel(Order.name)
        private orderModel: Model<Order>,
        private filesService: FilesService
    ) {}

    async getAllBarcodes(
        query: GetMedicinesDto,
        clinicId: ObjectId
    ): Promise<{ data: BarCode[]; count: number }> {
        const filter = {
            ...(query.search
                ? { batchId: { $regex: query.search, $options: "i" } }
                : {}),

            clinic: clinicId,
        };

        const [data, count] = await Promise.all([
            this.barCodeModel
                .find(filter)
                .skip(query.skip)
                .limit(query.limit)
                .populate([
                    { path: "medicine", select: "_id brandName" },
                    {
                        path: "orderId",
                        select: "_id supplier",
                        populate: {
                            path: "supplier",
                            select: "_id name",
                        },
                    },
                ])
                .exec(),
            this.barCodeModel.find(filter).countDocuments(),
        ]);

        const newData = (await Promise.all(
            data.map(async (barcode) => {
                if (barcode.barCodeUrl) {
                    const url = await this.filesService.createPresignedUrl(
                        barcode.barCodeUrl
                    );

                    barcode.barCodeUrl = url;
                }
                return barcode;
            })
        )) as BarCode[];

        return {
            data: newData,
            count,
        };
    }

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
                ).toString();
            } while (generatedBarcodes.has(barcode));

            generatedBarcodes.add(barcode);
            return `${barcode}`;
        };
        const dataArr = await Promise.all(
            createBarcodeDto.map(async (data) => {
                const barcodenum = generateUniqueBarcode();
                const buffer = await bwipjs.toBuffer({
                    bcid: "code128",
                    text: `${data.batchId} ${barcodenum}`,
                    scale: 3,
                    height: 10,
                    includetext: true,
                    textxalign: "center",
                });
                const imagedata = (await this.filesService.uploadFile(
                    {
                        originalname: data.batchId,
                        mimetype: "image/jpeg",
                        buffer: buffer,
                    },
                    clinicId,
                    FilePurpose.BARCODE
                )) as { url: string };

                return {
                    ...data,
                    clinic: clinicId,
                    barCodeUrl: imagedata.url,
                    barcode: barcodenum,
                };
            })
        );
        const session = await this.barCodeModel.startSession();
        session.startTransaction();

        try {
            const barcodes = await Promise.all(
                await this.barCodeModel.insertMany(dataArr, {
                    session: session,
                })
            );
            await this.orderModel.findByIdAndUpdate(
                createBarcodeDto[0].orderId,
                { hasBarcodeGenerated: true },
                { session: session }
            );

            await session.commitTransaction();
            session.endSession();
            return barcodes;
        } catch (error) {
            console.log("error", error);
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }
}
