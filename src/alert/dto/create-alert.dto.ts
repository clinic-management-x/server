import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
} from "class-validator";
import { AlertType } from "src/shared/shared.enum";

export class CreateAlertDto {
    @IsNotEmpty()
    @IsEnum(AlertType)
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsBoolean()
    enable: boolean;

    @IsNotEmpty()
    @IsNumber()
    days: number;
}
