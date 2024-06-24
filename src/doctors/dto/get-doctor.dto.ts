import { IsNotEmpty, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class GetDoctorDto {
    @IsNotEmpty()
    @IsString()
    @IsObjectId({
        message: "not a valid object ID",
    })
    _id: string;
}
