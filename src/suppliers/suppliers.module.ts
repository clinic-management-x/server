import { Module } from "@nestjs/common";
import { SuppliersService } from "./suppliers.service";

@Module({
    providers: [SuppliersService],
})
export class SuppliersModule {}
