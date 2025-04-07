import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { AppointmentStatus } from "src/appointment/appointment.entity";

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: "Email of the user" })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: "Password of the user" })
  password: string;
}

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: "Email of the user" })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: "Password of the user" })
  password: string;

  @IsNotEmpty()
  @ApiProperty({ description: "First name of the user" })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({ description: "Last name of the user" })
  lastName: string;

  @IsOptional()
  @ApiProperty({ description: "Phone number of the user", required: false })
  phone: string;
}

export class TokenDto {
  @IsNotEmpty()
  @ApiProperty({ description: "Token of the user" })
  token: string;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inviteeName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inviteeEmail?: string;
}
