import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsEmail, IsOptional, IsEnum, IsDate } from 'class-validator'
import { Transform } from 'class-transformer'
import { AppointmentStatus } from './appointment.entity'

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Title of the appointment' })
  @IsString()
  title: string

  @ApiProperty({
    description: 'Description of the appointment',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: 'Email of the person booking the appointment' })
  @IsEmail()
  inviteeEmail: string

  @ApiProperty({
    description: 'Name of the person booking the appointment',
    required: false,
  })
  @IsString()
  @IsOptional()
  inviteeName?: string

  @ApiProperty({ description: 'Start date and time of the appointment' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate: Date

  @ApiProperty({ description: 'End date and time of the appointment' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate: Date

  @ApiProperty({
    description: 'Status of the appointment',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus
}

export class UpdateAppointmentDto {
  @ApiProperty({ description: 'Title of the appointment', required: false })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({
    description: 'Description of the appointment',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: 'Email of the person booking the appointment',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  inviteeEmail?: string

  @ApiProperty({
    description: 'Name of the person booking the appointment',
    required: false,
  })
  @IsString()
  @IsOptional()
  inviteeName?: string

  @ApiProperty({
    description: 'Start date and time of the appointment',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  startDate?: Date

  @ApiProperty({
    description: 'End date and time of the appointment',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  endDate?: Date

  @ApiProperty({
    description: 'Status of the appointment',
    enum: AppointmentStatus,
    required: false,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus
}

export class BookAppointmentDto {
  @ApiProperty({ description: 'ID of the user who owns the availability' })
  @IsString()
  userId: string

  @ApiProperty({ description: 'Email of the person booking the appointment' })
  @IsEmail()
  inviteeEmail: string

  @ApiProperty({
    description: 'Name of the person booking the appointment',
    required: false,
  })
  @IsString()
  @IsOptional()
  inviteeName?: string

  @ApiProperty({ description: 'Title of the appointment' })
  @IsString()
  title: string

  @ApiProperty({ description: 'Start date and time of the appointment' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate: Date

  @ApiProperty({ description: 'End date and time of the appointment' })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate: Date

  @ApiProperty({
    description: 'Description for the appointment',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string
}
