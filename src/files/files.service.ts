import { Injectable } from "@nestjs/common";
import { Express } from "express";
import { ObjectId } from "src/shared/typings";
import { FilePurpose } from "src/shared/shared.enum";
import { ConfigService } from "@nestjs/config";
import * as AWS from "aws-sdk";
import {
    S3_ACCESS_KEY_ID,
    S3_BUCKET_NAME,
    S3_SECRET_ACCESS_KEY,
} from "src/shared/constants";
import * as crypto from "crypto";
import { File, FileDocument } from "./schema/file.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class FilesService {
    private S3: AWS.S3;
    private BUCKET: string;

    constructor(
        private configService: ConfigService,
        @InjectModel(File.name) private fileModel: Model<File>
    ) {
        this.S3 = new AWS.S3({
            accessKeyId: this.configService.get<string>(S3_ACCESS_KEY_ID),
            secretAccessKey:
                this.configService.get<string>(S3_SECRET_ACCESS_KEY),
            s3ForcePathStyle: true,
            signatureVersion: "v4",
        });
        this.BUCKET = this.configService.get<string>(S3_BUCKET_NAME);
    }

    async uploadFile(
        file: Express.Multer.File,
        clinicId: ObjectId,
        purpose: FilePurpose
    ): Promise<object> {
        const { originalname, buffer: fileBuffer, mimetype } = file;

        let path = `${crypto.randomUUID()}-${originalname}`;
        path = `${clinicId.toString()}/${path}`;

        const s3Response = await this.uploadToS3(fileBuffer, path, mimetype);
        const { Location: url } = s3Response;
        const fileDoc = await this.markTemporaryFile(purpose, url, clinicId);
        // TODO : Add Presign URL
        return { ...fileDoc.toObject(), presignedUrl: url };
    }

    async uploadToS3(file: Buffer, key: string, mimetype: string) {
        const params = {
            Bucket: this.BUCKET,
            Key: key,
            Body: file,
            ContentType: mimetype,
        };

        try {
            const s3Response = await this.S3.upload(params).promise();
            return s3Response;
        } catch (e) {
            console.log(e);
        }
    }

    markTemporaryFile(
        purpose: FilePurpose,
        url: string,
        clinicId: ObjectId
    ): Promise<FileDocument> {
        const file = new this.fileModel({ purpose, url, clinic: clinicId });
        return file.save();
    }
}
