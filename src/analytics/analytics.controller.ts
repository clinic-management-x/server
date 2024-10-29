import { Controller, Get, Query, Request } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { GetAnalyticsDto } from "./dtos/get-analytics.dto";
import { ClinicRequest } from "src/shared/typings";

@Controller("analytics")
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) {}

    @Get()
    async GetAll(
        @Query() query: GetAnalyticsDto,
        @Request() request: ClinicRequest
    ) {
        return this.analyticsService.getAnalyticsData(
            query,
            request.clinic._id
        );
    }
}
