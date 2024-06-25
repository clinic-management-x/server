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

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
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

        const payload = {
            sub: user._id,
            username: user.username,
            email: user.email,
            nonce: crypto.randomUUID(),
        };
        const accessToken = await this.jwtService.signAsync(payload);
        await this.usersService.createSessionForUser(
            user._id.toString(),
            payload.nonce
        );
        return { accessToken };
    }

    async register(email: string, password: string): Promise<UserDocument> {
        // Need to do email validation
        const user = await this.usersService.getOneByEmail(email);
        if (user) throw new ConflictException("Email already exists");
        return this.usersService.createAdminUser(email, password);
    }
}
