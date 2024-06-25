import { IsEmail, IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class SignInDto {
    @ValidateIf((dto) => typeof dto.email === "undefined")
    @IsString()
    username: string;

    @ValidateIf((dto) => typeof dto.username === "undefined")
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}
