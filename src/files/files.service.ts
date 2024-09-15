import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Express } from "express";
import { ObjectId } from "src/shared/typings";
import { FilePurpose } from "src/shared/shared.enum";
import { ConfigService } from "@nestjs/config";
import {
    AWS_REGION,
    S3_ACCESS_KEY_ID,
    S3_BUCKET_NAME,
    S3_SECRET_ACCESS_KEY,
} from "src/shared/constants";
import * as crypto from "crypto";
import { File, FileDocument } from "./schema/file.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
    DeleteObjectsCommand,
    GetObjectCommand,
    PutObjectCommand,
    PutObjectCommandOutput,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@smithy/url-parser";

@Injectable()
export class FilesService {
    private s3Client: S3Client;
    private bucketName: string;
    private region: string;

    constructor(
        private configService: ConfigService,
        @InjectModel(File.name) private fileModel: Model<File>
    ) {
        this.region = this.configService.get<string>(AWS_REGION);
        this.s3Client = new S3Client({
            credentials: {
                accessKeyId: this.configService.get<string>(S3_ACCESS_KEY_ID),
                secretAccessKey:
                    this.configService.get<string>(S3_SECRET_ACCESS_KEY),
            },
            region: this.region,
        });
        this.bucketName = this.configService.get<string>(S3_BUCKET_NAME);
    }

    private getKeyFromUrl(url: string): string {
        const pathArray = parseUrl(url).path.split("/");
        return pathArray.slice(2).join("/");
    }

    async uploadFile(
        file:
            | Express.Multer.File
            | { originalname: string; buffer: Buffer; mimetype: string },
        clinicId: ObjectId,
        purpose: FilePurpose
    ): Promise<object> {
        const { originalname, buffer: fileBuffer, mimetype } = file;

        let path = `${crypto.randomUUID()}-${originalname}`;
        path = `${clinicId.toString()}/${path}`;
        path = encodeURIComponent(path);

        await this.uploadToS3(fileBuffer, path, mimetype);
        const url = `https://s3.${this.region}.amazonaws.com/${this.bucketName}/${path}`;

        const fileDoc = await this.markTemporaryFile(purpose, url, clinicId);

        return {
            ...fileDoc.toObject(),
            presignedUrl: await this.createPresignedUrl(url),
        };
    }

    async uploadToS3(
        file: Buffer,
        key: string,
        mimetype: string
    ): Promise<PutObjectCommandOutput | undefined> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file,
            ContentType: mimetype,
        });

        try {
            const s3Response = await this.s3Client.send(command);
            return s3Response;
        } catch (err) {
            console.error(err);
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

    createPresignedUrl(url: string): Promise<string> {
        const key = this.getKeyFromUrl(url);
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        return getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // Will last for 1 hour
    }

    // Check if provided URLs were previously uploaded to S3 and by a particular clinic
    // This is to prevent other clinics from guessing URLs
    async checkFilesByUrls(
        urls: Array<string>,
        clinicId: ObjectId
    ): Promise<boolean> {
        const files = await this.fileModel.find({
            url: { $in: urls },
            clinic: clinicId,
        });

        if (files.length !== urls.length)
            throw new UnauthorizedException("Mismatch file URLs");
        return true;
    }

    // Delete file from S3 and files collection (eg. when actual data object is deleted)
    async deleteFiles(urls: Array<string>): Promise<void> {
        const command = new DeleteObjectsCommand({
            Bucket: this.bucketName,
            Delete: {
                Objects: urls.map((url) => ({ Key: this.getKeyFromUrl(url) })),
            },
        });

        try {
            await this.s3Client.send(command);
        } catch (err) {
            console.error(err);
        }

        await this.fileModel.deleteMany({
            url: { $in: urls },
        });
    }
}
