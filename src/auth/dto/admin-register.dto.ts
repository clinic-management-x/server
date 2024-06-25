import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AdminRegisterDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
