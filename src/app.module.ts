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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
