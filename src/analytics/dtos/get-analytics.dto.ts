import { IsDateString, IsNotEmpty } from "class-validator";

export class GetAnalyticsDto {
    @IsNotEmpty()
    @IsDateString()
    start: string;

    @IsNotEmpty()
    @IsDateString()
    end: string;
}
