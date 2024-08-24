import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
    Medicine,
    MedicineSchema,
} from "src/medicines/schemas/medicine.schema";
import { FilesModule } from "src/files/files.module";
import { Order, OrderSchema } from "./schemas/order.schema";
import { OrderItem, OrderItemSchema } from "./schemas/orderItemSchema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            {
                name: OrderItem.name,
                schema: OrderItemSchema,
            },
            { name: Medicine.name, schema: MedicineSchema },
        ]),
        FilesModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule {}
