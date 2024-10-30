import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateClinicDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsBoolean()
    @IsOptional()
    enableTelegram?: boolean;

    @IsBoolean()
    @IsOptional()
    enableViber?: boolean;

    @IsBoolean()
    @IsOptional()
    enableSMS?: boolean;
}

export class UpdateClinicPasswordDto {
    @IsNotEmpty()
    @IsString()
    password?: string;

    @IsNotEmpty()
    @IsString()
    newPassword?: string;
}
