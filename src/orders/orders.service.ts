import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { CreateOrderDto, OrderItemDto } from "./dto/create-order.dto";
import { ObjectId, ObjectList } from "src/shared/typings";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order, OrderDocument } from "./schemas/order.schema";
import { OrderItem } from "./schemas/orderItemSchema";
import { FilesService } from "src/files/files.service";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { GetBatchIdDto, GetOrdersDto } from "./dto/get-orders.dto";
import { UpdateOrderItemDto } from "./dto/update-order-item.dto";

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
                ? { batchId: { $regex: query.search, $options: "i" } }
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

    async searchBatchId(
        dto: GetBatchIdDto,
        clinicId: ObjectId
    ): Promise<boolean> {
        const alreadyExistingBatchId = await this.orderModel.findOne({
            batchId: dto.batchId,
            clinic: clinicId,
        });

        if (alreadyExistingBatchId) {
            return dto.isEdit
                ? alreadyExistingBatchId._id.toString() === dto._id.toString()
                    ? false
                    : true
                : true;
        } else {
            return false;
        }
    }
    async getBatchIdList(clinicId: ObjectId): Promise<object> {
        const batchIds = await this.orderModel
            .find({ clinic: clinicId }, { _id: 1, batchId: 1 })
            .exec();
        return batchIds;
    }

    async createOrder(
        createOrderDto: CreateOrderDto,
        clinicId: ObjectId
    ): Promise<OrderDocument> {
        const alreadyExistingBatchId = await this.orderModel.findOne({
            batchId: createOrderDto.batchId,
            clinic: clinicId,
        });
        if (alreadyExistingBatchId)
            throw new BadRequestException("BatchId must be unique.");

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
        if (updateOrderDto.batchId) {
            const alreadyExistingBatchId = await this.orderModel.findOne({
                batchId: updateOrderDto.batchId,
                clinic: clinicId,
            });
            if (
                alreadyExistingBatchId &&
                alreadyExistingBatchId._id.toString() !== order._id.toString()
            ) {
                throw new BadRequestException("Batch Id must be unique");
            }
        }

        Object.keys(updateOrderDto).map((key) => {
            order[key] = updateOrderDto[key];
        });

        const updatedOrder = (await order.save()).populate(populateQuery);

        return updatedOrder;
    }

    async createOrderItem(
        orderId: ObjectId,
        orderItemDto: OrderItemDto,
        clinicId: ObjectId
    ) {
        const order = await this.orderModel.findOne({
            _id: orderId,
            clinic: clinicId,
        });
        if (!order) throw new NotFoundException("Order Not Found");

        const orderItem = await this.orderItemModel.create(orderItemDto);

        if (orderItem) {
            order.orderItems = [...order.orderItems, orderItem._id];
            await order.save();
            return order.populate(populateQuery);
        }
    }

    async updateOrderItem(
        orderId: ObjectId,
        updateOrderItemDto: UpdateOrderItemDto,
        clinicId: ObjectId
    ) {
        const order = await this.orderModel.findOne({
            _id: orderId,
            clinic: clinicId,
        });
        if (!order) throw new NotFoundException("Order Not Found");

        await this.orderItemModel
            .findByIdAndUpdate(updateOrderItemDto.itemId, {
                quantity: updateOrderItemDto.quantity,
                unit: updateOrderItemDto.unit,
            })
            .exec();

        const orderAfterUpdated = await this.orderModel.findOne({
            _id: orderId,
            clinic: clinicId,
        });
        return orderAfterUpdated.populate(populateQuery);
    }

    async deleteOrderItem(id: ObjectId, orderId: ObjectId, clinicId: ObjectId) {
        const order = await this.orderModel.findOne({
            _id: orderId,
            clinic: clinicId,
        });
        if (!order) throw new NotFoundException("Order Not Found");

        await this.orderItemModel.findByIdAndDelete(id);

        order.orderItems = order.orderItems.filter(
            (itemid) => itemid.toString() !== id.toString()
        );
        await order.save();
        return order.populate(populateQuery);
    }
    async deleteOrder(id: ObjectId, clinicId: ObjectId) {
        const order = await this.orderModel.findOne({
            _id: id,
            clinic: clinicId,
        });
        if (!order) throw new NotFoundException("Order Not Found");
        if (order.orderItems) {
            await Promise.all(
                order.orderItems.map(async (orderitem) => {
                    await this.orderItemModel.findByIdAndDelete(orderitem);
                })
            );
        }
        const deleteOrder = await this.orderModel.findByIdAndDelete(id);
        if (deleteOrder) return { message: "Successfully deleted." };
    }
}
