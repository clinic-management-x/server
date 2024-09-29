import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class CreateTelegramInfo {
    @IsString()
    @IsNotEmpty()
    @IsObjectId()
    supplierId: string;

    @IsNotEmpty()
    @IsNumber()
    groupId: number;

    @IsString()
    @IsNotEmpty()
    @IsObjectId()
    clinicId: string;
}
