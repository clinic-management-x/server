import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { DoctorsModule } from "./doctors/doctors.module";
import { ClinicsModule } from "./clinics/clinics.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { MongooseConfigService } from "./mongoose-config.service";
import { FilesModule } from "./files/files.module";
import { StaffsModule } from "./staffs/staffs.module";
import { SuppliersModule } from "./suppliers/suppliers.module";
import { MedicinesModule } from "./medicines/medicines.module";
import { OrdersModule } from "./orders/orders.module";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            useClass: MongooseConfigService,
        }),
        DoctorsModule,
        ClinicsModule,
        AuthModule,
        UsersModule,
        FilesModule,
        StaffsModule,
        SuppliersModule,
        MedicinesModule,
        OrdersModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
