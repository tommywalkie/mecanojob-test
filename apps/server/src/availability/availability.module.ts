import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AvailabilityController } from "./availability.controller";
import { AvailabilityService } from "./availability.service";
import { Availability } from "./availability.entity";
import { AppointmentModule } from "../appointment/appointment.module";
/**
 * Module for handling user availability
 */
@Module({
  imports: [TypeOrmModule.forFeature([Availability]), AppointmentModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
