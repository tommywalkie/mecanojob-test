import {
  Controller,
  Post,
  Body,
  ClassSerializerInterceptor,
  UseInterceptors,
} from "@nestjs/common";
import { LoginDto, SignupDto, TokenDto } from "./dtos";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiBody, ApiOkResponse } from "@nestjs/swagger";
import { User } from "src/user/user.entity";

/**
 * Simple auth controller to handle login and signup
 */
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Login a user" })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: TokenDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("signup")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Signup a user" })
  @ApiBody({ type: SignupDto })
  @ApiOkResponse({ type: User })
  async signup(@Body() signupDto: SignupDto): Promise<User> {
    const user = await this.authService.signup(signupDto);
    console.log("Is instance?", user instanceof User);
    console.log("Object type:", Object.prototype.toString.call(user));
    return user;
  }
}
