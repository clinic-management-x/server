import { IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class GetSupplierDto {
    @IsNotEmpty()
    @IsObjectId()
    @IsString()
    _id: string;
}
