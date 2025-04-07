import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Appointment, AppointmentStatus } from "./appointment.entity";
import { User } from "../user/user.entity";
import {
  BookAppointmentDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from "./dtos";
import { DateTime } from "luxon";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>
  ) {}

  async create(
    user: User,
    createAppointmentDto: CreateAppointmentDto
  ): Promise<Appointment> {
    // Check for conflicts in the same time slot
    const { startDate, endDate } = createAppointmentDto;

    // Check for conflicts
    const conflictingAppointment = await this.appointmentRepository.findOne({
      where: [
        {
          user: { id: user.id },
          startDate: LessThanOrEqual(endDate),
          endDate: MoreThanOrEqual(startDate),
          status: AppointmentStatus.CONFIRMED,
        },
      ],
    });

    if (conflictingAppointment) {
      throw new ConflictException("Time slot is already booked");
    }

    const appointment = new Appointment({
      ...createAppointmentDto,
      user,
      status: AppointmentStatus.CONFIRMED,
    });

    return this.appointmentRepository.save(appointment);
  }

  async findAll(userId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { user: { id: userId } },
      order: { startDate: "ASC" },
    });
  }

  async findOne(id: string, userId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    return appointment;
  }

  async update(
    id: string,
    userId: string,
    updateAppointmentDto: UpdateAppointmentDto
  ): Promise<Appointment> {
    const appointment = await this.findOne(id, userId);

    Object.assign(appointment, updateAppointmentDto);

    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string, userId: string): Promise<void> {
    const appointment = await this.findOne(id, userId);

    await this.appointmentRepository.remove(appointment);
  }

  async getUpcomingAppointments(userId: string): Promise<Appointment[]> {
    const now = DateTime.local();

    return this.appointmentRepository.find({
      where: {
        user: { id: userId },
        startDate: MoreThanOrEqual(now.toJSDate()),
      },
      order: { startDate: "ASC" },
    });
  }

  async bookAppointment(
    bookAppointmentDto: BookAppointmentDto
  ): Promise<Appointment> {
    const { userId, ...otherData } = bookAppointmentDto;

    const appointment = new Appointment({
      ...otherData,
      user: { id: userId } as User,
      status: AppointmentStatus.PENDING,
    });

    return this.appointmentRepository.save(appointment);
  }
}
