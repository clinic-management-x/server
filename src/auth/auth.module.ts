import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JWT_SECRET } from "src/shared/constants";
import { AuthGuard } from "./auth.guard";
import { ClinicsModule } from "src/clinics/clinics.module";

@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            provide: "APP_GUARD",
            useClass: AuthGuard,
        },
    ],
    imports: [
        UsersModule,
        ClinicsModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                global: true,
                secret: configService.get<string>(JWT_SECRET),
                signOptions: { expiresIn: "90d" },
            }),
        }),
    ],
})
export class AuthModule {}
