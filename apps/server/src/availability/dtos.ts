import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsOptional, Min, Max, IsISO8601, IsNumber, IsUUID, IsEnum } from 'class-validator'
import { Transform } from 'class-transformer'

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

export class TimeSlotDto {
  @ApiProperty({ enum: DAYS_OF_WEEK })
  @IsEnum(DAYS_OF_WEEK)
  day: DayOfWeek

  @ApiProperty({ minimum: 0, maximum: 23 })
  @IsNumber()
  @Min(0)
  @Max(23)
  startHour: number

  @ApiProperty({ minimum: 0, maximum: 59 })
  @IsNumber()
  @Min(0)
  @Max(59)
  startMinute: number

  @ApiProperty({ minimum: 0, maximum: 23 })
  @IsNumber()
  @Min(0)
  @Max(23)
  endHour: number

  @ApiProperty({ minimum: 0, maximum: 59 })
  @IsNumber()
  @Min(0)
  @Max(59)
  endMinute: number
}

export class CreateAvailabilityDto {
  @ApiProperty({ type: [TimeSlotDto] })
  timeSlots: TimeSlotDto[]
}

export class UpdateAvailabilityDto extends CreateAvailabilityDto {}

export class GetPublicAvailabilitiesDto {
  @ApiProperty({ description: 'ID of the user whose availabilities to view' })
  @IsString()
  userId: string

  @ApiProperty({
    description: 'Start date for the availability search range',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  startDate?: Date

  @ApiProperty({
    description: 'End date for the availability search range',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  endDate?: Date

  @ApiProperty({
    description: 'Filter by specific day of week (1-7, where 1 is Monday)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  dayOfWeek?: number
}
