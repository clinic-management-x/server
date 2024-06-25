import { IsEnum, IsNotEmpty } from "class-validator";
import { FilePurpose } from "src/shared/shared.enum";

export class FileDto {
    @IsNotEmpty()
    @IsEnum(FilePurpose)
    purpose: FilePurpose;
}
