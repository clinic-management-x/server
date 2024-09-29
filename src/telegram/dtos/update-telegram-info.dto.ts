import { IsNotEmpty, IsNumber } from "class-validator";

export class UpdateTelegramInfoDto {
    @IsNotEmpty()
    @IsNumber()
    groupId: number;
}
