import { IsBoolean, IsOptional, IsString } from "class-validator";

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
