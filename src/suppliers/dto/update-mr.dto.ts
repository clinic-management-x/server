import { IsEmail, IsMobilePhone, IsOptional, IsString } from "class-validator";

export class UpdateMRDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsMobilePhone()
    mobile?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    contacts?: { name: string; value: string }[];
}
