import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Availability } from "./availability.entity";
import { User } from "../user/user.entity";
import { CreateAvailabilityDto, UpdateAvailabilityDto } from "./dtos";
import { AppointmentService } from "src/appointment/appointment.service";
import { DateTime } from "luxon";

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    private readonly appointmentService: AppointmentService
  ) {}

  async create(
    user: User,
    createAvailabilityDto: CreateAvailabilityDto
  ): Promise<Availability> {
    // Check for conflicts in the same time slot
    const existing = await this.availabilityRepository.findOne({
      where: {
        user: { id: user.id },
        day: createAvailabilityDto.day,
        startHour: createAvailabilityDto.startHour,
        startMinute: createAvailabilityDto.startMinute,
      },
    });

    if (existing) {
      throw new ConflictException(
        "Availability already exists for this time slot"
      );
    }

    const availability = new Availability({
      ...createAvailabilityDto,
      user,
    });

    return this.availabilityRepository.save(availability);
  }

  async findAll(userId: string): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { user: { id: userId } },
      order: { day: "ASC", startHour: "ASC", startMinute: "ASC" },
    });
  }

  async findOne(id: string, userId: string): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!availability) {
      throw new NotFoundException("Availability not found");
    }
    return availability;
  }

  async update(
    id: string,
    userId: string,
    updateAvailabilityDto: UpdateAvailabilityDto
  ): Promise<Availability> {
    const availability = await this.findOne(id, userId);
    Object.assign(availability, updateAvailabilityDto);
    return this.availabilityRepository.save(availability);
  }

  async remove(id: string, userId: string): Promise<void> {
    const availability = await this.findOne(id, userId);
    await this.availabilityRepository.remove(availability);
  }

  async getUserAvailabilities(userId: string): Promise<Availability[]> {
    const appointments = await this.appointmentService.getUpcomingAppointments(
      userId
    );
    const availabilities = await this.availabilityRepository.find({
      where: { user: { id: userId } },
      order: { day: "ASC", startHour: "ASC", startMinute: "ASC" },
    });

    return availabilities.filter((availability) => {
      // Filter out availabilities that conflict with appointments
      return !appointments.some((appointment) => {
        // Extract day of week from appointment date (1 = Monday)
        // Note: Luxon's weekday is 1-7 where 1 is Monday, matching our data model
        const appointmentDate = DateTime.fromJSDate(appointment.startDate);
        const appointmentDay = appointmentDate.weekday;

        // Check if appointment is on the same day of week as availability
        if (appointmentDay !== availability.day) {
          return false; // No conflict if different days
        }

        // Convert availability times to minutes for easier comparison
        const availStartMinutes =
          availability.startHour * 60 + availability.startMinute;
        const availEndMinutes =
          availStartMinutes + availability.durationMinutes;

        // Convert appointment times to minutes using Luxon
        const apptStart = DateTime.fromJSDate(appointment.startDate);
        const apptEnd = DateTime.fromJSDate(appointment.endDate);

        const apptStartMinutes = apptStart.hour * 60 + apptStart.minute;
        const apptEndMinutes = apptEnd.hour * 60 + apptEnd.minute;

        // Check for overlap - standard interval overlap formula
        return (
          apptStartMinutes < availEndMinutes &&
          apptEndMinutes > availStartMinutes
        );
      });
    });
  }
}
