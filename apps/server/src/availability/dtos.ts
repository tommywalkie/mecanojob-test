import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsString,
  IsOptional,
  Min,
  Max,
  IsISO8601,
  IsNumber,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateAvailabilityDto {
  @ApiProperty({ description: "The day of the week (0-6, where 0 is Sunday)" })
  @IsInt()
  @Min(0)
  @Max(6)
  day: number;

  @ApiProperty({ description: "Starting hour in 24h format (0-23)" })
  @IsInt()
  @Min(0)
  @Max(23)
  startHour: number;

  @ApiProperty({ description: "Starting minute (0-59)" })
  @IsInt()
  @Min(0)
  @Max(59)
  startMinute: number;

  @ApiProperty({ description: "Duration in minutes" })
  @IsInt()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({
    description: "Optional instructions for the meeting",
    required: false,
  })
  @IsString()
  @IsOptional()
  instructions?: string;
}

export class UpdateAvailabilityDto extends CreateAvailabilityDto {}

export class GetPublicAvailabilitiesDto {
  @ApiProperty({ description: "ID of the user whose availabilities to view" })
  @IsString()
  userId: string;

  @ApiProperty({
    description: "Start date for the availability search range",
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  startDate?: Date;

  @ApiProperty({
    description: "End date for the availability search range",
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  endDate?: Date;

  @ApiProperty({
    description: "Filter by specific day of week (1-7, where 1 is Monday)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  dayOfWeek?: number;
}
