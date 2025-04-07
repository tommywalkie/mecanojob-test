import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsISO8601,
} from "class-validator";
import { Transform } from "class-transformer";
import { AppointmentStatus } from "./appointment.entity";

export class CreateAppointmentDto {
  @ApiProperty({ description: "Email of the person booking the appointment" })
  @IsEmail()
  inviteeEmail: string;

  @ApiProperty({ description: "Start date and time of the appointment" })
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({ description: "End date and time of the appointment" })
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @ApiProperty({
    description: "Notes for the appointment",
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAppointmentDto {
  @ApiProperty({
    description: "Status of the appointment",
    enum: AppointmentStatus,
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @ApiProperty({
    description: "Notes for the appointment",
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class BookAppointmentDto {
  @ApiProperty({ description: "ID of the user who owns the availability" })
  @IsString()
  userId: string;

  @ApiProperty({ description: "Email of the person booking the appointment" })
  @IsEmail()
  inviteeEmail: string;

  @ApiProperty({ description: "Start date and time of the appointment" })
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({
    description: "Notes for the appointment",
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
