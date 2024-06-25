import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import {
    IGNORE_CLINIC,
    IS_PUBLIC_ROUTE,
    JWT_SECRET,
} from "src/shared/constants";
import { UsersService } from "src/users/users.service";
import { Payload } from "./payload.interface";
import { UserType } from "src/shared/shared.enum";
import { ClinicsService } from "src/clinics/clinics.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private clinicService: ClinicsService,
        private configService: ConfigService,
        private reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.checkRouteMetadata<boolean>(
            context,
            IS_PUBLIC_ROUTE
        );
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync<Payload>(token, {
                secret: this.configService.get<string>(JWT_SECRET),
            });
            // I know it's not the true OAuth way but we won't worry about refresh tokens for now
            const user = await this.usersService.updateSessionForUser(
                payload.sub, // sub == _id of user
                payload.nonce
            );

            // Figure out which clinic is making the call
            // Notice that we could use user details to obtain this information in the handlers
            // But this is a very repetitive step so we decided to centralize it here
            if (!this.checkRouteMetadata<boolean>(context, IGNORE_CLINIC)) {
                if (user.userType === UserType.ADMIN) {
                    const clinic = await this.clinicService.getClinicByUserId(
                        user._id
                    );
                    request["clinic"] = clinic;
                } else {
                    const clinic = await this.clinicService.getClinicByUserId(
                        user.parentUser
                    );
                    request["clinic"] = clinic;
                }
            }

            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request["payload"] = payload;
            request["token"] = token;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }

    private checkRouteMetadata<T>(context: ExecutionContext, key: string): T {
        return this.reflector.getAllAndOverride<T>(key, [
            context.getHandler(),
            context.getClass(),
        ]);
    }
}
