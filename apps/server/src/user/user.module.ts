import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { AvailabilityModule } from "src/availability/availability.module";

/**
 * User module responsible for handling user object related requests
 */
@Module({
  imports: [TypeOrmModule.forFeature([User]), AvailabilityModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
