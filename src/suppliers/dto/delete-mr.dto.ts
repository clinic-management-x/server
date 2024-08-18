import { IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class DeleteMrDto {
    @IsNotEmpty()
    @IsObjectId()
    @IsString()
    supplier_id: string;
}
