import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { LoginDto, SignupDto } from "./dtos";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.getUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return {
      token: this.jwtService.sign({ id: user.id }),
    };
  }

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userService.getUserByEmail(signupDto.email);
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const newUser = { ...signupDto, password: hashedPassword };
    const user = await this.userService.createUser(newUser);
    return {
      token: this.jwtService.sign({ id: user.id }),
    };
  }
}
