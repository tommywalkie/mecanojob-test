import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
  Query,
} from "@nestjs/common";
import { AvailabilityService } from "./availability.service";
import { Availability } from "./availability.entity";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  GetPublicAvailabilitiesDto,
} from "./dtos";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { DateTime } from "luxon";

@Controller("availabilities")
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags("availabilities")
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new availability" })
  @ApiBody({ type: CreateAvailabilityDto })
  @ApiOkResponse({ type: Availability })
  async create(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @Request() req
  ): Promise<Availability> {
    return this.availabilityService.create(req.user, createAvailabilityDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all of the current user's availabilities" })
  @ApiOkResponse({ type: [Availability] })
  async findAll(@Request() req): Promise<Availability[]> {
    return this.availabilityService.findAll(req.user.id);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a specific availability by ID" })
  @ApiOkResponse({ type: Availability })
  async findOne(
    @Param("id") id: string,
    @Request() req
  ): Promise<Availability> {
    return this.availabilityService.findOne(id, req.user.id);
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update an availability" })
  @ApiBody({ type: UpdateAvailabilityDto })
  @ApiOkResponse({ type: Availability })
  async update(
    @Param("id") id: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
    @Request() req
  ): Promise<Availability> {
    return this.availabilityService.update(
      id,
      req.user.id,
      updateAvailabilityDto
    );
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete an availability" })
  async remove(@Param("id") id: string, @Request() req): Promise<void> {
    return this.availabilityService.remove(id, req.user.id);
  }

  @Get("public")
  @ApiOperation({ summary: "Get public availabilities for a user" })
  @ApiResponse({
    status: 200,
    description: "Returns available time slots for a user",
  })
  async getPublicAvailabilities(
    @Query() queryParams: GetPublicAvailabilitiesDto
  ): Promise<any> {
    const { userId, startDate, endDate, dayOfWeek } = queryParams;

    // Convert dates to Luxon DateTime objects if provided
    const dtStart = startDate ? DateTime.fromJSDate(startDate) : null;
    const dtEnd = endDate ? DateTime.fromJSDate(endDate) : null;

    // Get all availabilities and filter them
    const availabilities = await this.availabilityService.getUserAvailabilities(
      userId
    );

    // Apply additional filters
    let filteredAvailabilities = availabilities;

    if (dayOfWeek) {
      filteredAvailabilities = filteredAvailabilities.filter(
        (a) => a.day === dayOfWeek
      );
    }

    // Format the response with Luxon
    return filteredAvailabilities.map((availability) => {
      // Create a DateTime object for this availability
      const availTime = DateTime.fromObject({
        hour: availability.startHour,
        minute: availability.startMinute,
      });

      const endTime = availTime.plus({ minutes: availability.durationMinutes });

      return {
        id: availability.id,
        day: availability.day,
        dayName: this.getDayName(availability.day),
        startTime: availTime.toFormat("HH:mm"),
        endTime: endTime.toFormat("HH:mm"),
        durationMinutes: availability.durationMinutes,
      };
    });
  }

  // The helper methods can be simplified with Luxon
  private getDayName(day: number): string {
    // Create a DateTime for a day with the given weekday
    const dt = DateTime.local().set({ weekday: day });
    return dt.weekdayLong;
  }
}
