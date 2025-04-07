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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
} from "@nestjs/swagger";
import { AvailabilityService } from "../availability/availability.service";
import { Availability } from "../availability/availability.entity";

@Controller("api/users")
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly availabilityService: AvailabilityService
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Create a user" })
  @ApiBody({ type: User })
  @ApiOkResponse({ type: User })
  async create(@Body() user: User): Promise<User> {
    return this.userService.createUser(user);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get all users" })
  @ApiOkResponse({ type: [User] })
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Get a user by id" })
  @ApiOkResponse({ type: User })
  async findOne(@Param("id") id: string): Promise<User> {
    return this.userService.getUser({ id });
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Update a user by id" })
  @ApiOkResponse({ type: User })
  async update(@Param("id") id: string, @Body() user: User): Promise<User> {
    return this.userService.updateUser(id, user);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: "Patch a user by id" })
  @ApiOkResponse({ type: User })
  async patch(@Param("id") id: string, @Body() user: User): Promise<User> {
    return this.userService.patchUser(id, user);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete a user by id" })
  async remove(@Param("id") id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }

  @Get(":id/availabilities")
  @ApiOperation({ summary: "Get public availabilities for a user" })
  async getAvailabilities(@Param("id") id: string): Promise<Availability[]> {
    return this.availabilityService.findAll(id);
  }
}
