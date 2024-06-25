import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    SetMetadata,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { IS_PUBLIC_ROUTE } from "src/shared/constants";
import { User } from "src/users/schemas/user.schema";
import { AdminRegisterDto } from "./dto/admin-register.dto";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post("login")
    @SetMetadata(IS_PUBLIC_ROUTE, true)
    signIn(@Body() signInDto: SignInDto): Promise<object> {
        return this.authService.signIn(
            signInDto.password,
            signInDto.username,
            signInDto.email
        );
    }

    @Post("register")
    @SetMetadata(IS_PUBLIC_ROUTE, true)
    register(@Body() adminRegisterDto: AdminRegisterDto): Promise<User> {
        return this.authService.register(
            adminRegisterDto.email,
            adminRegisterDto.password
        );
    }
}
