import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class UpdateNotificationDto {
    @IsNotEmpty()
    @IsObjectId()
    @IsString()
    _id: string;

    @IsNotEmpty()
    @IsBoolean()
    hasRead: boolean;
}
