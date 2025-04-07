import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AvailabilityService } from "./availability.service";
import { Availability } from "./availability.entity";
import { User } from "../user/user.entity";
import { AppointmentService } from "../appointment/appointment.service";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { CreateAvailabilityDto } from "./dtos";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMockRepository, MockRepository } from "../utils";

describe("AvailabilityService", () => {
  let service: AvailabilityService;
  let availabilityRepository: MockRepository<Availability>;
  let appointmentService: { getUpcomingAppointments: ReturnType<typeof vi.fn> };

  const user = { id: "1", email: "test@example.com" } as User;

  // Monday to Friday, 9AM-12PM and 2PM-7PM, 30-minute slots
  const createWorkSchedule = (): Availability[] => {
    const availabilities: Availability[] = [];

    // Days 1-5 (Monday to Friday)
    for (let day = 1; day <= 5; day++) {
      // Morning slots (9AM-12PM)
      for (let hour = 9; hour < 12; hour++) {
        for (let minute of [0, 30]) {
          availabilities.push(
            new Availability({
              id: `avail-${day}-${hour}-${minute}`,
              day,
              startHour: hour,
              startMinute: minute,
              durationMinutes: 30,
              user,
            })
          );
        }
      }

      // Afternoon slots (2PM-7PM)
      for (let hour = 14; hour < 19; hour++) {
        for (let minute of [0, 30]) {
          availabilities.push(
            new Availability({
              id: `avail-${day}-${hour}-${minute}`,
              day,
              startHour: hour,
              startMinute: minute,
              durationMinutes: 30,
              user,
            })
          );
        }
      }
    }

    return availabilities;
  };

  beforeEach(async () => {
    appointmentService = {
      getUpcomingAppointments: vi.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: getRepositoryToken(Availability),
          useFactory: createMockRepository,
        },
        {
          provide: AppointmentService,
          useValue: appointmentService,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    availabilityRepository = module.get<MockRepository<Availability>>(
      getRepositoryToken(Availability)
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create an availability if slot is free", async () => {
      const dto: CreateAvailabilityDto = {
        day: 1,
        startHour: 10,
        startMinute: 0,
        durationMinutes: 30,
      };

      availabilityRepository.findOne.mockResolvedValue(null);
      availabilityRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity)
      );

      const result = await service.create(user, dto);

      expect(result).toEqual({
        ...dto,
        user,
      });
      expect(availabilityRepository.findOne).toHaveBeenCalled();
      expect(availabilityRepository.save).toHaveBeenCalled();
    });

    it("should throw ConflictException if availability already exists", async () => {
      const dto: CreateAvailabilityDto = {
        day: 1,
        startHour: 10,
        startMinute: 0,
        durationMinutes: 30,
      };

      availabilityRepository.findOne.mockResolvedValue({
        ...dto,
        id: "existing-id",
      });

      await expect(service.create(user, dto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("findAll", () => {
    it("should return all availabilities for a user", async () => {
      const availabilities = createWorkSchedule();
      availabilityRepository.find.mockResolvedValue(availabilities);

      const result = await service.findAll(user.id);

      expect(result).toEqual(availabilities);
      expect(availabilityRepository.find).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
        order: { day: "ASC", startHour: "ASC", startMinute: "ASC" },
      });
    });
  });

  describe("findOne", () => {
    it("should return a single availability", async () => {
      const availability = createWorkSchedule()[0];
      availabilityRepository.findOne.mockResolvedValue(availability);

      const result = await service.findOne(availability.id, user.id);

      expect(result).toEqual(availability);
      expect(availabilityRepository.findOne).toHaveBeenCalled();
    });

    it("should throw NotFoundException if availability not found", async () => {
      availabilityRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("non-existent-id", user.id)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("update", () => {
    it("should update an availability", async () => {
      const availability = createWorkSchedule()[0];
      const updateDto = {
        day: 2,
        startHour: 11,
        startMinute: 30,
        durationMinutes: 45,
      };

      availabilityRepository.findOne.mockResolvedValue(availability);
      availabilityRepository.save.mockImplementation((entity) =>
        Promise.resolve(entity)
      );

      const result = await service.update(availability.id, user.id, updateDto);

      expect(result).toEqual({
        ...availability,
        ...updateDto,
      });
    });
  });

  describe("getUserAvailabilities", () => {
    it("should filter out availabilities with appointments", async () => {
      // 1. Create a simple set of availabilities
      const mondayAt10 = new Availability({
        id: "monday-10am",
        day: 1, // Monday
        startHour: 10,
        startMinute: 0,
        durationMinutes: 30,
        user,
      });

      const mondayAt1030 = new Availability({
        id: "monday-1030am",
        day: 1, // Monday
        startHour: 10,
        startMinute: 30,
        durationMinutes: 30,
        user,
      });

      const availabilities = [mondayAt10, mondayAt1030];

      // 2. Create an appointment that conflicts with the first availability
      const appointment = {
        startDate: new Date(2023, 0, 2, 10, 0), // Monday at 10:00 AM
        endDate: new Date(2023, 0, 2, 10, 30), // Monday at 10:30 AM
      };

      // 3. Set up our mocks
      availabilityRepository.find.mockResolvedValue(availabilities);
      appointmentService.getUpcomingAppointments.mockResolvedValue([
        appointment,
      ]);

      // 4. Call the method
      const result = await service.getUserAvailabilities(user.id);

      // 5. Verify availabilities are filtered out
      expect(result.length).toBe(1); // One availability should be filtered out
      expect(result[0].id).toBe("monday-1030am"); // Only the 10:30 slot should remain
      expect(result).not.toContainEqual(mondayAt10); // The 10:00 slot should be filtered
    });
  });
});
