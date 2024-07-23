import { IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class GetStaffDto {
    @IsNotEmpty()
    @IsObjectId()
    @IsString()
    _id: string;
}
