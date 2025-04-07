import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AppointmentService } from "./appointment.service";
import { Appointment, AppointmentStatus } from "./appointment.entity";
import { User } from "../user/user.entity";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { CreateAppointmentDto, BookAppointmentDto } from "./dtos";
import { describe, it, expect, beforeEach } from "vitest";
import { createMockRepository, MockRepository } from "../utils";

describe("AppointmentService", () => {
  let service: AppointmentService;
  let appointmentRepository: MockRepository<Appointment>;

  const user = { id: "1", email: "test@example.com" } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(Appointment),
          useFactory: createMockRepository,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    appointmentRepository = module.get<MockRepository<Appointment>>(
      getRepositoryToken(Appointment)
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create an appointment if no conflict", async () => {
      const dto: CreateAppointmentDto = {
        inviteeEmail: "invitee@example.com",
        startDate: new Date("2023-01-02T10:00:00"), // Monday 10:00 AM
        endDate: new Date("2023-01-02T10:30:00"), // Monday 10:30 AM
        notes: "Test appointment",
      };

      appointmentRepository.findOne.mockResolvedValue(null);
      appointmentRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity)
      );

      const result = await service.create(user, dto);

      expect(result).toEqual({
        ...dto,
        user,
        status: AppointmentStatus.CONFIRMED,
      });
      expect(appointmentRepository.findOne).toHaveBeenCalled();
      expect(appointmentRepository.save).toHaveBeenCalled();
    });

    it("should throw ConflictException if time slot is booked", async () => {
      const dto: CreateAppointmentDto = {
        inviteeEmail: "invitee@example.com",
        startDate: new Date("2023-01-02T10:00:00"),
        endDate: new Date("2023-01-02T10:30:00"),
        notes: "Test appointment",
      };

      appointmentRepository.findOne.mockResolvedValue({
        id: "existing-appointment",
      });

      await expect(service.create(user, dto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("findAll", () => {
    it("should return all appointments for a user", async () => {
      const appointments = [
        {
          id: "appt1",
          inviteeEmail: "invitee1@example.com",
          startDate: new Date("2023-01-02T10:00:00"),
          endDate: new Date("2023-01-02T10:30:00"),
          status: AppointmentStatus.CONFIRMED,
        },
        {
          id: "appt2",
          inviteeEmail: "invitee2@example.com",
          startDate: new Date("2023-01-03T14:00:00"),
          endDate: new Date("2023-01-03T14:30:00"),
          status: AppointmentStatus.PENDING,
        },
      ];

      appointmentRepository.find.mockResolvedValue(appointments);

      const result = await service.findAll(user.id);

      expect(result).toEqual(appointments);
      expect(appointmentRepository.find).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
        order: { startDate: "ASC" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a single appointment", async () => {
      const appointment = {
        id: "appt1",
        inviteeEmail: "invitee@example.com",
        startDate: new Date("2023-01-02T10:00:00"),
        endDate: new Date("2023-01-02T10:30:00"),
        status: AppointmentStatus.CONFIRMED,
      };

      appointmentRepository.findOne.mockResolvedValue(appointment);

      const result = await service.findOne(appointment.id, user.id);

      expect(result).toEqual(appointment);
      expect(appointmentRepository.findOne).toHaveBeenCalled();
    });

    it("should throw NotFoundException if appointment not found", async () => {
      appointmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("non-existent-id", user.id)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("update", () => {
    it("should update an appointment status", async () => {
      const appointment = {
        id: "appt1",
        inviteeEmail: "invitee@example.com",
        startDate: new Date("2023-01-02T10:00:00"),
        endDate: new Date("2023-01-02T10:30:00"),
        status: AppointmentStatus.PENDING,
      };

      const updateDto = {
        status: AppointmentStatus.CONFIRMED,
        notes: "Updated notes",
      };

      appointmentRepository.findOne.mockResolvedValue(appointment);
      appointmentRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity)
      );

      const result = await service.update(appointment.id, user.id, updateDto);

      expect(result).toEqual({
        ...appointment,
        ...updateDto,
      });
    });
  });

  describe("bookAppointment", () => {
    it("should book an appointment with PENDING status", async () => {
      const dto: BookAppointmentDto = {
        userId: user.id,
        inviteeEmail: "invitee@example.com",
        startDate: new Date("2023-01-02T10:00:00"),
        notes: "Booking test",
      };

      appointmentRepository.save.mockResolvedValue({
        id: "new-appointment",
        user: { id: dto.userId },
        inviteeEmail: dto.inviteeEmail,
        startDate: dto.startDate,
        notes: dto.notes,
        status: AppointmentStatus.PENDING,
      });

      const result = await service.bookAppointment(dto);

      expect(result).toHaveProperty("id", "new-appointment");
      expect(result.inviteeEmail).toBe(dto.inviteeEmail);
      expect(result.status).toBe(AppointmentStatus.PENDING);
      expect(appointmentRepository.save).toHaveBeenCalled();
    });
  });

  describe("getUpcomingAppointments", () => {
    it("should return upcoming appointments for a user", async () => {
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + 1);

      const appointments = [
        {
          id: "appt1",
          startDate: futureDate,
          endDate: new Date(futureDate.getTime() + 30 * 60000),
          status: AppointmentStatus.CONFIRMED,
        },
      ];

      appointmentRepository.find.mockResolvedValue(appointments);

      const result = await service.getUpcomingAppointments(user.id);

      expect(result).toEqual(appointments);
      expect(appointmentRepository.find).toHaveBeenCalled();
      expect(
        appointmentRepository.find.mock.calls[0][0].where.startDate
      ).toBeDefined();
    });
  });
});
