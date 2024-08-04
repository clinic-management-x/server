import {
    IsEmail,
    IsMobilePhone,
    IsOptional,
    IsString,
    IsUrl,
} from "class-validator";

export class UpdateSupplierDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsUrl()
    avatar?: string;

    @IsOptional()
    @IsMobilePhone()
    mobile?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    contacts?: { name: string; value: string }[];
}
