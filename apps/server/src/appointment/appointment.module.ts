import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppointmentController } from "./appointment.controller";
import { AppointmentService } from "./appointment.service";
import { Appointment } from "./appointment.entity";

/**
 * Module for handling appointment scheduling
 */
@Module({
  imports: [TypeOrmModule.forFeature([Appointment])],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
