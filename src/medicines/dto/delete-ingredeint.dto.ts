import { IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class DeleteIngredientDto {
    @IsNotEmpty()
    @IsObjectId()
    @IsString()
    medicineId: string;
}
