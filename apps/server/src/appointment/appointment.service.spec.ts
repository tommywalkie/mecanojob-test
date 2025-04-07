import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppointmentService } from "./appointment.service";
import { Appointment, AppointmentStatus } from "./appointment.entity";
import { User } from "../user/user.entity";
import { NotFoundException } from "@nestjs/common";
import {
  BookAppointmentDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from "./dtos";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("AppointmentService", () => {
  let service: AppointmentService;
  let appointmentRepository: Repository<Appointment>;

  const mockUserId = "test-user-id";
  const mockUser = new User({ id: mockUserId, email: "test@example.com" });

  const mockAppointmentRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockAppointmentRepository,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    appointmentRepository = module.get<Repository<Appointment>>(
      getRepositoryToken(Appointment)
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new appointment", async () => {
      const createDto: CreateAppointmentDto = {
        title: "Test Appointment",
        inviteeEmail: "invitee@example.com",
        startDate: new Date("2023-05-01T10:00:00Z"),
        endDate: new Date("2023-05-01T11:00:00Z"),
      };

      const expectedAppointment = new Appointment({
        ...createDto,
        userId: mockUserId,
        user: mockUser,
        status: AppointmentStatus.PENDING,
      });

      mockAppointmentRepository.save.mockResolvedValue(expectedAppointment);

      const result = await service.create(mockUser, createDto);

      expect(result).toEqual(expectedAppointment);
      expect(mockAppointmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: createDto.title,
          inviteeEmail: createDto.inviteeEmail,
          startDate: createDto.startDate,
          endDate: createDto.endDate,
          userId: mockUserId,
          user: mockUser,
          status: AppointmentStatus.PENDING,
        })
      );
    });

    it("should respect the status when provided", async () => {
      const createDto: CreateAppointmentDto = {
        title: "Test Appointment",
        inviteeEmail: "invitee@example.com",
        startDate: new Date("2023-05-01T10:00:00Z"),
        endDate: new Date("2023-05-01T11:00:00Z"),
        status: AppointmentStatus.CONFIRMED,
      };

      mockAppointmentRepository.save.mockImplementation(
        (appointment) => appointment
      );

      const result = await service.create(mockUser, createDto);

      expect(result.status).toEqual(AppointmentStatus.CONFIRMED);
    });
  });

  describe("findAll", () => {
    it("should return all appointments for a user", async () => {
      const mockAppointments = [
        new Appointment({
          id: "appt-1",
          userId: mockUserId,
          title: "Meeting 1",
          inviteeEmail: "test@example.com",
          startDate: new Date("2023-05-01T10:00:00Z"),
          endDate: new Date("2023-05-01T11:00:00Z"),
          status: AppointmentStatus.PENDING,
        }),
        new Appointment({
          id: "appt-2",
          userId: mockUserId,
          title: "Meeting 2",
          inviteeEmail: "other@example.com",
          startDate: new Date("2023-05-02T14:00:00Z"),
          endDate: new Date("2023-05-02T15:00:00Z"),
          status: AppointmentStatus.CONFIRMED,
        }),
      ];

      mockAppointmentRepository.find.mockResolvedValue(mockAppointments);

      const result = await service.findAll(mockUserId);

      expect(result).toEqual(mockAppointments);
      expect(mockAppointmentRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { startDate: "ASC" },
      });
    });
  });

  describe("findOne", () => {
    it("should return an appointment if found", async () => {
      const mockAppointment = new Appointment({
        id: "appt-1",
        userId: mockUserId,
        title: "Meeting 1",
        inviteeEmail: "test@example.com",
        startDate: new Date("2023-05-01T10:00:00Z"),
        endDate: new Date("2023-05-01T11:00:00Z"),
        status: AppointmentStatus.PENDING,
      });

      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);

      const result = await service.findOne("appt-1", mockUserId);

      expect(result).toEqual(mockAppointment);
      expect(mockAppointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "appt-1", userId: mockUserId },
      });
    });

    it("should throw NotFoundException if appointment not found", async () => {
      mockAppointmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("non-existent", mockUserId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("update", () => {
    it("should update an appointment", async () => {
      const mockAppointment = new Appointment({
        id: "appt-1",
        userId: mockUserId,
        title: "Original Title",
        inviteeEmail: "test@example.com",
        startDate: new Date("2023-05-01T10:00:00Z"),
        endDate: new Date("2023-05-01T11:00:00Z"),
        status: AppointmentStatus.PENDING,
      });

      const updateDto: UpdateAppointmentDto = {
        title: "Updated Title",
        status: AppointmentStatus.CONFIRMED,
      };

      const updatedAppointment = {
        ...mockAppointment,
        ...updateDto,
      };

      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);
      mockAppointmentRepository.save.mockResolvedValue(updatedAppointment);

      const result = await service.update("appt-1", mockUserId, updateDto);

      expect(result).toEqual(updatedAppointment);
      expect(mockAppointmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "appt-1",
          title: "Updated Title",
          status: AppointmentStatus.CONFIRMED,
        })
      );
    });
  });

  describe("remove", () => {
    it("should delete an appointment", async () => {
      const mockAppointment = new Appointment({
        id: "appt-1",
        userId: mockUserId,
      });

      mockAppointmentRepository.findOne.mockResolvedValue(mockAppointment);

      await service.remove("appt-1", mockUserId);

      expect(mockAppointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: "appt-1", userId: mockUserId },
      });
      expect(mockAppointmentRepository.remove).toHaveBeenCalledWith(
        mockAppointment
      );
    });
  });

  describe("getUpcomingAppointments", () => {
    it("should return future appointments for a user", async () => {
      const now = new Date();
      const mockAppointments = [
        new Appointment({
          id: "appt-1",
          userId: mockUserId,
          startDate: new Date(now.getTime() + 3600000), // 1 hour in the future
          endDate: new Date(now.getTime() + 7200000), // 2 hours in the future
        }),
      ];

      mockAppointmentRepository.find.mockResolvedValue(mockAppointments);

      const result = await service.getUpcomingAppointments(mockUserId);

      expect(result).toEqual(mockAppointments);
      expect(mockAppointmentRepository.find).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          startDate: expect.any(Object), // MoreThan constraint
        },
        order: { startDate: "ASC" },
      });
    });
  });

  describe("bookAppointment", () => {
    it("should book an appointment for an invitee", async () => {
      const bookDto: BookAppointmentDto = {
        userId: mockUserId,
        title: "Booked Meeting",
        inviteeEmail: "invitee@example.com",
        inviteeName: "Invitee Name",
        startDate: new Date("2023-05-01T10:00:00Z"),
        endDate: new Date("2023-05-01T11:00:00Z"),
        description: "Booking description",
      };

      const expectedAppointment = new Appointment({
        ...bookDto,
        status: AppointmentStatus.PENDING,
      });

      mockAppointmentRepository.save.mockResolvedValue(expectedAppointment);

      const result = await service.bookAppointment(bookDto);

      expect(result).toEqual(expectedAppointment);
      expect(mockAppointmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          title: bookDto.title,
          inviteeEmail: bookDto.inviteeEmail,
          inviteeName: bookDto.inviteeName,
          startDate: bookDto.startDate,
          endDate: bookDto.endDate,
          description: bookDto.description,
          status: AppointmentStatus.PENDING,
        })
      );
    });
  });
});
