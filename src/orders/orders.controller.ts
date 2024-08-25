import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ClinicRequest } from "src/shared/typings";
import { GetBatchIdDto, GetOrdersDto } from "./dto/get-orders.dto";
import { GetOrderDto } from "./dto/get-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Controller("orders")
export class OrdersController {
    constructor(private orderService: OrdersService) {}

    @Get()
    async getAllMedicines(
        @Query() query: GetOrdersDto,
        @Request() request: ClinicRequest
    ) {
        return this.orderService.getAllOrders(query, request.clinic._id);
    }

    @Get("/search")
    async searchBatchId(
        @Query() { batchId }: GetBatchIdDto,
        @Request() request: ClinicRequest
    ) {
        return this.orderService.searchBatchId(batchId, request.clinic._id);
    }
    @Get("/list")
    async getBatchIdList(@Request() request: ClinicRequest) {
        console.log(">>><<<<");
        return this.orderService.getBatchIdList(request.clinic._id);
    }

    @Get(":_id")
    async get(
        @Param() { _id }: GetOrderDto,
        @Request() request: ClinicRequest
    ): Promise<object> {
        return this.orderService.getOrder(_id, request.clinic._id);
    }

    @Post()
    async createOrder(
        @Body() createOrderDto: CreateOrderDto,
        @Request() request: ClinicRequest
    ) {
        return this.orderService.createOrder(
            createOrderDto,
            request.clinic._id
        );
    }

    @Patch(":_id")
    async updateOrder(
        @Param() { _id }: GetOrderDto,
        @Body() updateOrderDto: UpdateOrderDto,
        @Request() request: ClinicRequest
    ) {
        return this.orderService.updateOrder(
            _id,
            updateOrderDto,
            request.clinic._id
        );
    }
}
