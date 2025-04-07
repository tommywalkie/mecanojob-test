import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { Appointment, AppointmentStatus } from "./appointment.entity";
import { User } from "../user/user.entity";
import {
  BookAppointmentDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from "./dtos";

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
    const appointment = new Appointment({
      ...createAppointmentDto,
      user,
      userId: user.id,
      status: createAppointmentDto.status || AppointmentStatus.PENDING,
    });

    return this.appointmentRepository.save(appointment);
  }

  async findAll(userId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { userId },
      order: { startDate: "ASC" },
    });
  }

  async findOne(id: string, userId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, userId },
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
    const now = new Date();

    return this.appointmentRepository.find({
      where: {
        userId,
        startDate: MoreThan(now),
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
      userId,
      user: { id: userId } as User,
      status: AppointmentStatus.PENDING,
    });

    return this.appointmentRepository.save(appointment);
  }

  async updateAppointment(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOneBy({ id });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Update only the fields that are provided
    Object.assign(appointment, updateAppointmentDto);

    return this.appointmentRepository.save(appointment);
  }

  async findBookedAppointments(userId: string): Promise<Appointment[]> {
    // Get all appointments for the user that are either pending or confirmed
    return this.appointmentRepository.find({
      where: [
        { userId, status: AppointmentStatus.PENDING },
        { userId, status: AppointmentStatus.CONFIRMED },
      ],
      order: { startDate: "ASC" },
    });
  }
}
