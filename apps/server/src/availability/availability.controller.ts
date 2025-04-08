import { Controller, Get, Post, Body, Delete, UseGuards, Request, Param } from '@nestjs/common'
import { AvailabilityService } from './availability.service'
import { Availability } from './availability.entity'
import { AuthGuard } from '../auth/auth.guard'
import { CreateAvailabilityDto } from './dtos'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { AppointmentService } from '../appointment/appointment.service'

@Controller('api/availabilities')
@ApiTags('availabilities')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly appointmentService: AppointmentService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update user availabilities' })
  async create(@Body() createAvailabilityDto: CreateAvailabilityDto, @Request() req): Promise<Availability[]> {
    return this.availabilityService.create(req.user, createAvailabilityDto)
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all availabilities for the current user' })
  async findAll(@Request() req): Promise<Availability[]> {
    return this.availabilityService.findAll(req.user.id)
  }

  @Delete()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete all availabilities for the current user' })
  async remove(@Request() req): Promise<void> {
    return this.availabilityService.remove(req.user.id)
  }

  @Get('/users/:userId')
  @ApiOperation({
    summary: 'Get user availability settings and booked appointments (public endpoint)',
  })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  async getUserAvailability(@Param('userId') userId: string) {
    // Get the user's availability settings
    const availabilitySettings = await this.availabilityService.findAll(userId)

    // Get the user's pending and confirmed appointments
    const bookedAppointments = await this.appointmentService.findBookedAppointments(userId)

    // Return both availability settings and booked time slots
    return {
      availability: availabilitySettings,
      bookedSlots: bookedAppointments.map((appointment) => ({
        startDate: appointment.startDate,
        endDate: appointment.endDate,
        id: appointment.id,
      })),
    }
  }
}
