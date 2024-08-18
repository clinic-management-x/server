import {
    IsArray,
    IsEmail,
    IsMobilePhone,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class MedicalRepresentative {
    @IsOptional()
    @IsString()
    _id?: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsMobilePhone()
    @IsNotEmpty()
    mobile: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsOptional()
    @IsArray()
    contacts?: { name: string; value: string }[];
}

class SupplierCompany {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @IsMobilePhone()
    @IsNotEmpty()
    mobile: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsOptional()
    @IsArray()
    contacts?: { name: string; value: string }[];
}
export class CreateSupplierDto {
    @IsNotEmpty()
    company: SupplierCompany;

    @IsOptional()
    representatives?: MedicalRepresentative[];
}

export class MRDto {
    @IsNotEmpty()
    mr: MedicalRepresentative;

    @IsNotEmpty()
    @IsObjectId()
    _id: string;
}
