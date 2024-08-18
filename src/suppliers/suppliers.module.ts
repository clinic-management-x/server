import { Module } from "@nestjs/common";
import { SuppliersService } from "./suppliers.service";
import { SuppliersController } from "./suppliers.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Supplier, SupplierSchema } from "./schemas/supplier.schema";
import {
    MedicalRepresentative,
    MedicalRepresentativeSchema,
} from "./schemas/medrepresentaive.schema";
import { FilesModule } from "src/files/files.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Supplier.name, schema: SupplierSchema },
            {
                name: MedicalRepresentative.name,
                schema: MedicalRepresentativeSchema,
            },
        ]),
        FilesModule,
    ],
    controllers: [SuppliersController],
    providers: [SuppliersService],
})
export class SuppliersModule {}
