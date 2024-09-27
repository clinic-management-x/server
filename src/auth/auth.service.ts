import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserDocument } from "src/users/schemas/user.schema";
import { UsersService } from "src/users/users.service";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { AuthTokens } from "src/shared/typings";
import { ConfigService } from "@nestjs/config";
import {
    ACCESS_TOKEN_DURATION,
    JWT_SECRET,
    REFRESH_TOKEN_DURATION,
} from "src/shared/constants";
import { Payload } from "./payload.interface";
import { ClinicsService } from "src/clinics/clinics.service";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private clinicsService: ClinicsService
    ) {}

    async signIn(
        providedPass: string,
        username?: string,
        email?: string
    ): Promise<object> {
        let user: UserDocument;
        if (username) {
            // Staffs and Doctors TODO : can check if associated clinic exists
            user = await this.usersService.getOneByUsername(username);
        } else if (email) {
            // Clinic Admin TODO : can require 2FA
            user = await this.usersService.getOneByEmail(email);
        }

        if (!user) throw new NotFoundException("User not found");
        if (!(await bcrypt.compare(providedPass, user.password)))
            throw new UnauthorizedException();

        const clinic = await this.clinicsService.getClinicByUserId(user._id);
        const clinicId = clinic._id;

        const { accessToken, refreshToken, nonce } =
            await this.generateTokenPair(user);
        await this.usersService.clearExpiredSessionsForUser(user._id);
        await this.usersService.createSessionForUser(user._id, nonce);
        return { accessToken, refreshToken, clinicId };
    }

    async register(email: string, password: string): Promise<UserDocument> {
        // Need to do email validation
        const user = await this.usersService.getOneByEmail(email);
        if (user) throw new ConflictException("Email already exists");
        return this.usersService.createAdminUser(email, password);
    }

    async refreshToken(oldRefreshToken: string) {
        const oldPayload = await this.jwtService
            .verifyAsync<Payload>(oldRefreshToken, {
                secret: this.configService.get<string>(JWT_SECRET),
            })
            .catch((e) => {
                throw new UnauthorizedException(e);
            });

        await this.usersService.clearExpiredSessionsForUser(oldPayload.sub);

        const user = await this.usersService.getOneById(oldPayload.sub);
        if (!user) throw new NotFoundException("User not found");

        const nonce = oldPayload.nonce;
        const payload = this.constructTokenPayload(user, nonce); // Same nonce, same session
        const accessToken = await this.generateAccessToken(payload);
        const refreshToken = await this.generateRefreshToken(payload);

        await this.usersService.refreshSessionForUser(
            payload.sub, // sub == _id of user
            nonce
        );

        return { accessToken, refreshToken };
    }

    logout(payload: Payload): Promise<UserDocument> {
        return this.usersService.removeSessionForUser(
            payload.sub,
            payload.nonce
        );
    }

    async generateTokenPair(
        user: UserDocument
    ): Promise<AuthTokens & { nonce: string }> {
        const payload = this.constructTokenPayload(user);
        const accessToken = await this.generateAccessToken(payload);
        const refreshToken = await this.generateRefreshToken(payload);
        return { accessToken, refreshToken, nonce: payload.nonce };
    }

    constructTokenPayload(user: UserDocument, nonce?: string): Payload {
        const payload: Payload = {
            sub: user._id,
            username: user.username,
            email: user.email,
            nonce: nonce || crypto.randomUUID(),
        };
        return payload;
    }

    generateAccessToken(payload: Payload): Promise<string> {
        return this.jwtService.signAsync(payload, {
            expiresIn: ACCESS_TOKEN_DURATION,
        });
    }

    generateRefreshToken(payload: Payload): Promise<string> {
        return this.jwtService.signAsync(payload, {
            expiresIn: REFRESH_TOKEN_DURATION,
        });
    }
}
