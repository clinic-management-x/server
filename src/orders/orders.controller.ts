import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Request,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto, OrderItemDto } from "./dto/create-order.dto";
import { ClinicRequest } from "src/shared/typings";
import { GetBatchIdDto, GetOrdersDto } from "./dto/get-orders.dto";
import { GetOrderDto, OrderIdDto } from "./dto/get-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { UpdateOrderItemDto } from "./dto/update-order-item.dto";

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

    @Get("/list")
    async getBatchIdList(@Request() request: ClinicRequest) {
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

    @Post("/search")
    async searchBatchId(
        @Body() dto: GetBatchIdDto,
        @Request() request: ClinicRequest
    ) {
        return this.orderService.searchBatchId(dto, request.clinic._id);
    }
    @Put("/order-item/:_id")
    async createOrderItem(
        @Param() params: GetOrderDto,
        @Body() orderItemDto: OrderItemDto,
        @Request() request: ClinicRequest
    ) {
        return this.orderService.createOrderItem(
            params._id,
            orderItemDto,
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

    @Patch("/order-item/:_id")
    async updateOrderItem(
        @Param() { _id }: GetOrderDto,
        @Body() updateOrderItemDto: UpdateOrderItemDto,
        @Request() request: ClinicRequest
    ) {
        return this.orderService.updateOrderItem(
            _id,
            updateOrderItemDto,
            request.clinic._id
        );
    }

    @Delete("/order-item/:_id")
    async deleteOrderItem(
        @Param() params: GetOrderDto,
        @Query() query: OrderIdDto,
        @Request() request: ClinicRequest
    ) {
        return this.orderService.deleteOrderItem(
            params._id,
            query.id,
            request.clinic._id
        );
    }

    @Delete("/:_id")
    async deleteOrder(
        @Param() params: GetOrderDto,

        @Request() request: ClinicRequest
    ) {
        return this.orderService.deleteOrder(params._id, request.clinic._id);
    }
}
