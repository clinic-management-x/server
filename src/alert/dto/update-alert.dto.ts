import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";
import { AlertType } from "src/shared/shared.enum";

export class UpdateAlertDto {
    @IsNotEmpty()
    @IsEnum(AlertType)
    @IsString()
    type: string;

    @IsOptional()
    @IsBoolean()
    enable?: boolean;

    @IsOptional()
    @IsNumber()
    days?: number;
}

export class AlertIdDto {
    @IsNotEmpty()
    @IsObjectId()
    @IsString()
    _id: string;
}
