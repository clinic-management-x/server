import { IsNotEmpty, IsString } from "class-validator";

export class CreateClinicDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}
