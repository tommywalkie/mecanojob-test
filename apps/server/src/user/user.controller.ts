import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { AuthGuard } from "../auth/auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("users")
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() user: User): Promise<User> {
    return this.userService.createUser(user);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param("id") id: string): Promise<User> {
    return this.userService.getUser({ id });
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  async update(@Param("id") id: string, @Body() user: User): Promise<User> {
    return this.userService.updateUser(id, user);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async patch(@Param("id") id: string, @Body() user: User): Promise<User> {
    return this.userService.patchUser(id, user);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async remove(@Param("id") id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
