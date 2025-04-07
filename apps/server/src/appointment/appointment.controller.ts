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
} from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { Appointment } from "./appointment.entity";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  BookAppointmentDto,
} from "./dtos";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";

@Controller("appointments")
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags("appointments")
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Create a new appointment (for authenticated users)",
  })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiOkResponse({ type: Appointment })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req
  ): Promise<Appointment> {
    return this.appointmentService.create(req.user, createAppointmentDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all appointments for the current user" })
  @ApiOkResponse({ type: [Appointment] })
  async findAll(@Request() req): Promise<Appointment[]> {
    return this.appointmentService.findAll(req.user.id);
  }

  @Get("upcoming")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get upcoming appointments for the current user" })
  @ApiOkResponse({ type: [Appointment] })
  async getUpcoming(@Request() req): Promise<Appointment[]> {
    return this.appointmentService.getUpcomingAppointments(req.user.id);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get a specific appointment by ID" })
  @ApiOkResponse({ type: Appointment })
  async findOne(@Param("id") id: string, @Request() req): Promise<Appointment> {
    return this.appointmentService.findOne(id, req.user.id);
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update an appointment" })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiOkResponse({ type: Appointment })
  async update(
    @Param("id") id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req
  ): Promise<Appointment> {
    return this.appointmentService.update(
      id,
      req.user.id,
      updateAppointmentDto
    );
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete an appointment" })
  async remove(@Param("id") id: string, @Request() req): Promise<void> {
    return this.appointmentService.remove(id, req.user.id);
  }

  @Post("book")
  @ApiOperation({ summary: "Book an appointment (for visitors)" })
  @ApiBody({ type: BookAppointmentDto })
  @ApiOkResponse({ type: Appointment })
  async book(
    @Body() bookAppointmentDto: BookAppointmentDto
  ): Promise<Appointment> {
    return this.appointmentService.bookAppointment(bookAppointmentDto);
  }
}
