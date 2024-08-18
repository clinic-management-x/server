import {
    IsEmail,
    IsMobilePhone,
    IsOptional,
    IsString,
    IsUrl,
    ValidateIf,
} from "class-validator";

export class UpdateSupplierDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    @ValidateIf((e) => e === "")
    @IsUrl({})
    avatarUrl?: string;

    @IsOptional()
    @IsMobilePhone()
    mobile?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    contacts?: { name: string; value: string }[];
}
