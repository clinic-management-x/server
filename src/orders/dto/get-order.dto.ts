import { IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class GetOrderDto {
    @IsNotEmpty()
    @IsObjectId()
    @IsString()
    _id: string;
}
