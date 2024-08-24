import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ObjectId, ObjectList } from "src/shared/typings";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, OrderDocument } from "./schemas/order.schema";
import { OrderItem } from "./schemas/orderItemSchema";
import { FilesService } from "src/files/files.service";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { GetOrdersDto } from "./dto/get-orders.dto";

const populateQuery = [
    {
        path: "supplier",
        select: "_id name",
    },
    {
        path: "orderItems",
        populate: {
            path: "itemName",
            select: "_id brandName",
        },
    },
];

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(OrderItem.name)
        private orderItemModel: Model<OrderItem>,
        private filesService: FilesService
    ) {}

    async getAllOrders(
        query: GetOrdersDto,
        clinicId: ObjectId
    ): Promise<ObjectList<object>> {
        const filter = {
            ...(query.search
                ? { brandName: { $regex: query.search, $options: "i" } }
                : {}),

            clinic: clinicId,
        };

        const [data, count] = await Promise.all([
            this.orderModel
                .find(filter)
                .skip(query.skip)
                .limit(query.limit)
                .populate(populateQuery)
                .exec(),
            this.orderModel.find(filter).countDocuments(),
        ]);

        return {
            data,
            count,
        };
    }

    async getOrder(
        orderId: ObjectId,
        clinicId: ObjectId
    ): Promise<OrderDocument> {
        const order = await this.orderModel.findOne({
            _id: orderId,
            clinic: clinicId,
        });
        if (!order) throw new NotFoundException("Order Not Found.");
        return order.populate(populateQuery);
    }

    async searchBatchId(batchId: string, clinicId: ObjectId): Promise<boolean> {
        const alreadyExistingBatchId = await this.orderModel.findOne({
            batchId: batchId,
            clinic: clinicId,
        });
        if (alreadyExistingBatchId) {
            return true;
        } else {
            return false;
        }
    }

    async createOrder(
        createOrderDto: CreateOrderDto,
        clinicId: ObjectId
    ): Promise<OrderDocument> {
        const orderItems = await this.orderItemModel.insertMany(
            createOrderDto.orderItems
        );
        const data = {
            ...createOrderDto,
            orderItems: orderItems.map((item) => item._id),
            clinic: clinicId,
        };
        const order = (await this.orderModel.create(data)).populate(
            populateQuery
        );
        return order;
    }

    async updateOrder(
        orderId: ObjectId,
        updateOrderDto: UpdateOrderDto,
        clinicId: ObjectId
    ): Promise<OrderDocument> {
        const order = await this.orderModel.findOne({
            _id: orderId,
            clinic: clinicId,
        });
        if (!order) throw new NotFoundException("Order Not Found");

        Object.keys(updateOrderDto).map((key) => {
            order[key] = updateOrderDto[key];
        });

        const updatedOrder = (await order.save()).populate(populateQuery);

        return updatedOrder;
    }
}
