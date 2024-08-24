import { IsOptional, IsString } from "class-validator";

export class GetDrugInfoDto {
    @IsOptional()
    @IsString()
    search: string;
}
