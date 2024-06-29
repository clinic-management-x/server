import {
    Body,
    Controller,
    HttpStatus,
    ParseFilePipeBuilder,
    Post,
    Request,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FilesService } from "./files.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { FileDto } from "./dto/file.dto";
import { ClinicRequest } from "src/shared/typings";

@Controller("files")
export class FilesController {
    constructor(private filesService: FilesService) {}

    @Post("upload")
    @UseInterceptors(FileInterceptor("file"))
    uploadFile(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addMaxSizeValidator({
                    maxSize: 1024 * 1024 * 20, // 20MB file size max
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                })
        )
        file: Express.Multer.File,
        @Body() info: FileDto,
        @Request() request: ClinicRequest
    ) {
        console.log("req", request);
        return this.filesService.uploadFile(
            file,
            request.clinic._id,
            info.purpose
        );
    }
}
