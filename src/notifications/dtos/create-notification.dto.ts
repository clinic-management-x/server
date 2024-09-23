import { IsBoolean, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { NotificationType } from "src/shared/shared.enum";

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsEnum(NotificationType)
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsBoolean()
    hasRead: boolean;

    @IsNotEmpty()
    @IsString()
    message: string;
}
