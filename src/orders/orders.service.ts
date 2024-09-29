import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { CreateOrderDto, OrderItemDto } from "./dto/create-order.dto";
import { ObjectId, ObjectList } from "src/shared/typings";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";
import { Order, OrderDocument } from "./schemas/order.schema";
import { OrderItem } from "./schemas/orderItemSchema";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { GetBatchIdDto, GetOrdersDto } from "./dto/get-orders.dto";
import { UpdateOrderItemDto } from "./dto/update-order-item.dto";
import { Medicine } from "src/medicines/schemas/medicine.schema";
import { BarCode } from "src/medicines/schemas/barcode.schema";
import { TelegramGroupInfo } from "src/telegram/schemas/telegram-info.schema";
import { TelegramService } from "src/telegram/telegram.service";
import * as dayjs from "dayjs";

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
        @InjectModel(Medicine.name)
        private medicineModel: Model<Medicine>,
        @InjectModel(BarCode.name)
        private barcodeModel: Model<BarCode>,
        @InjectModel(TelegramGroupInfo.name)
        private TelegramModel: Model<TelegramGroupInfo>,
        private telegramService: TelegramService
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

    async getValidOrdersForBarcodeGeneration(
        query: GetOrdersDto,
        clinicId: ObjectId
    ): Promise<ObjectList<object>> {
        const filter = {
            ...(query.search
                ? { batchId: { $regex: query.search, $options: "i" } }
                : {}),

            clinic: clinicId,
            hasAlreadyArrived: true,
            hasBarcodeGenerated: false,
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
        const session = await this.orderModel.startSession();
        session.startTransaction();

        try {
            const alreadyExistingBatchId = await this.orderModel.findOne(
                {
                    batchId: createOrderDto.batchId,
                    clinic: clinicId,
                },
                null,
                { session }
            );
            if (alreadyExistingBatchId)
                throw new BadRequestException("BatchId must be unique.");

            const orderItems = await this.orderItemModel.insertMany(
                createOrderDto.orderItems,
                { session }
            );
            const data = {
                ...createOrderDto,
                orderItems: orderItems.map((item) => item._id),
                clinic: clinicId,
            };

            const order = new this.orderModel(data);
            await order.save({ session });

            const telegramInfo = await this.TelegramModel.findOne(
                {
                    supplierId: createOrderDto.supplier,
                    clinicId,
                },
                null,
                { session }
            ).populate({
                path: "supplierId",
                select: "_id name",
            });

            if (telegramInfo) {
                const message = `
Hello ${(telegramInfo.supplierId as any).name},

We would like to order:
${createOrderDto.orderItems.map((orderitem) => ` ${orderitem.itemName.brandName} >> ${orderitem.quantity} ${orderitem.unit}`).join("\n")}

Estimate Date Of Arrival: ${dayjs(order.estimateDate).format("DD/MM/YYYY")}
`;
                this.telegramService.sendMessageToUser(
                    "" + telegramInfo.groupId,
                    message
                );
            }

            if (order.hasAlreadyArrived) {
                await this.increaseStockQuantity(orderItems, session);
            }

            await session.commitTransaction();
            session.endSession();
            return order.populate(populateQuery);
        } catch (error) {
            console.log("error", error);
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }

    async updateOrder(
        orderId: ObjectId,
        updateOrderDto: UpdateOrderDto,
        clinicId: ObjectId
    ): Promise<OrderDocument> {
        const session = await this.orderModel.startSession();
        session.startTransaction();

        try {
            const order = await this.orderModel.findOne(
                {
                    _id: orderId,
                    clinic: clinicId,
                },
                null,
                { session }
            );
            if (!order) throw new NotFoundException("Order Not Found");
            if (updateOrderDto.batchId) {
                const alreadyExistingBatchId = await this.orderModel.findOne(
                    {
                        batchId: updateOrderDto.batchId,
                        clinic: clinicId,
                    },
                    null,
                    { session }
                );
                if (
                    alreadyExistingBatchId &&
                    alreadyExistingBatchId._id.toString() !==
                        order._id.toString()
                ) {
                    throw new BadRequestException("Batch Id must be unique");
                }
            }
            Object.keys(updateOrderDto).map((key) => {
                order[key] = updateOrderDto[key];
            });

            const updatedOrder = await (
                await order.save({ session })
            ).populate(populateQuery);

            if (updatedOrder.hasAlreadyArrived) {
                await this.increaseStockQuantity(
                    updatedOrder.orderItems,
                    session
                );
            }
            await session.commitTransaction();
            session.endSession();
            return updatedOrder;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }

    async increaseStockQuantity(orderItems: any[], session: ClientSession) {
        await Promise.all(
            orderItems.map(async (orderItem: any) => {
                await this.medicineModel.findByIdAndUpdate(
                    orderItem.itemName._id,
                    { $inc: { stockQuantity: orderItem.quantity } },
                    {
                        session,
                    }
                );
            })
        );
    }

    async createOrderItem(
        orderId: ObjectId,
        orderItemDto: OrderItemDto,
        clinicId: ObjectId
    ) {
        const session = await this.orderItemModel.startSession();
        session.startTransaction();
        try {
            const order = await this.orderModel.findOne(
                {
                    _id: orderId,
                    clinic: clinicId,
                },
                null,
                { session }
            );
            if (!order) throw new NotFoundException("Order Not Found");
            const orderItem = new this.orderItemModel(orderItemDto);

            await orderItem.save({ session });

            if (orderItem) {
                order.orderItems = [...order.orderItems, orderItem._id];
                await order.save({ session });
                return order.populate(populateQuery);
            }
            await session.commitTransaction();
            session.endSession();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
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

        if (order.hasAlreadyArrived) {
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
    }

    async deleteOrderItem(id: ObjectId, orderId: ObjectId, clinicId: ObjectId) {
        const session = await this.orderItemModel.startSession();
        session.startTransaction();
        try {
            const order = await this.orderModel.findOne(
                {
                    _id: orderId,
                    clinic: clinicId,
                },
                null,
                { session }
            );
            if (!order) throw new NotFoundException("Order Not Found");
            const orderItemToDelete = await this.orderItemModel.findOne({
                _id: id,
            });

            await this.orderItemModel.findByIdAndDelete(id, { session });

            if (order.hasAlreadyArrived) {
                await this.medicineModel.findByIdAndUpdate(
                    orderItemToDelete.itemName,
                    { $inc: { stockQuantity: -orderItemToDelete.quantity } },
                    { session }
                );
            }
            if (order.hasBarcodeGenerated) {
                await this.barcodeModel.deleteMany(
                    {
                        orderId: order._id,
                        medicine: orderItemToDelete.itemName,
                    },
                    { session }
                );
            }
            order.orderItems = order.orderItems.filter(
                (itemid) => itemid.toString() !== id.toString()
            );
            await order.save({ session });
            await session.commitTransaction();
            session.endSession();
            return order.populate(populateQuery);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }

    async deleteOrder(id: ObjectId, clinicId: ObjectId) {
        const session = await this.orderModel.startSession();
        session.startTransaction();
        try {
            const order = await this.orderModel.findOne(
                {
                    _id: id,
                    clinic: clinicId,
                },
                null,
                { session }
            );
            if (!order) throw new NotFoundException("Order Not Found");

            if (order.orderItems) {
                await Promise.all(
                    order.orderItems.map(async (orderitem) => {
                        const orderItemToDelete =
                            await this.orderItemModel.findOne(
                                {
                                    _id: orderitem,
                                },
                                null,
                                { session }
                            );

                        await this.orderItemModel.findByIdAndDelete(
                            orderitem,

                            {
                                session,
                            }
                        );
                        if (order.hasAlreadyArrived) {
                            await this.medicineModel.findByIdAndUpdate(
                                orderItemToDelete.itemName,
                                {
                                    $inc: {
                                        stockQuantity:
                                            -orderItemToDelete.quantity,
                                    },
                                },
                                { session }
                            );
                        }
                    })
                );
            }

            if (order.hasBarcodeGenerated) {
                await this.barcodeModel.deleteMany(
                    { orderId: order._id },
                    { session }
                );
            }
            const deleteOrder = await this.orderModel.findByIdAndDelete(id, {
                session,
            });
            await session.commitTransaction();
            session.endSession();
            if (deleteOrder) return { message: "Successfully deleted." };
        } catch (error) {
            console.log("error", error);
            await session.abortTransaction();
            session.endSession();
            throw new InternalServerErrorException(
                "Something wrong during transaction."
            );
        }
    }
}
