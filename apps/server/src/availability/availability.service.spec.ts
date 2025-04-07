import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AvailabilityService } from "./availability.service";
import { Availability } from "./availability.entity";
import { User } from "../user/user.entity";
import { NotFoundException } from "@nestjs/common";
import { CreateAvailabilityDto, TimeSlotDto } from "./dtos";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("AvailabilityService", () => {
  let service: AvailabilityService;
  let availabilityRepository: Repository<Availability>;

  const mockUserId = "test-user-id";
  const mockUser = new User({ id: mockUserId, email: "test@example.com" });

  const mockAvailabilityRepository = {
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
        AvailabilityService,
        {
          provide: getRepositoryToken(Availability),
          useValue: mockAvailabilityRepository,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    availabilityRepository = module.get<Repository<Availability>>(
      getRepositoryToken(Availability)
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all availabilities for a user", async () => {
      const mockAvailabilities = [
        new Availability({
          id: "avail-1",
          userId: mockUserId,
          day: "monday",
          startHour: 9,
          startMinute: 0,
          endHour: 10,
          endMinute: 0,
        }),
        new Availability({
          id: "avail-2",
          userId: mockUserId,
          day: "tuesday",
          startHour: 10,
          startMinute: 30,
          endHour: 11,
          endMinute: 30,
        }),
      ];

      mockAvailabilityRepository.find.mockResolvedValue(mockAvailabilities);

      const result = await service.findAll(mockUserId);
      expect(result).toEqual(mockAvailabilities);
      expect(mockAvailabilityRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { day: "ASC", startHour: "ASC", startMinute: "ASC" },
      });
    });
  });

  describe("create", () => {
    it("should create availabilities from time slots", async () => {
      const timeSlots: TimeSlotDto[] = [
        {
          day: "monday",
          startHour: 10,
          startMinute: 0,
          endHour: 11,
          endMinute: 0,
        },
        {
          day: "tuesday",
          startHour: 14,
          startMinute: 30,
          endHour: 15,
          endMinute: 30,
        },
      ];

      const dto: CreateAvailabilityDto = {
        timeSlots,
      };

      const expectedAvailabilities = timeSlots.map(
        (slot) =>
          new Availability({
            userId: mockUserId,
            user: mockUser,
            ...slot,
          })
      );

      mockAvailabilityRepository.save.mockResolvedValue(expectedAvailabilities);

      const result = await service.create(mockUser, dto);

      expect(mockAvailabilityRepository.delete).toHaveBeenCalledWith({
        userId: mockUserId,
      });

      expect(mockAvailabilityRepository.save).toHaveBeenCalled();

      const saveArg = mockAvailabilityRepository.save.mock.calls[0][0];
      expect(saveArg).toHaveLength(2);

      expect(saveArg[0]).toMatchObject({
        userId: mockUserId,
        day: "monday",
        startHour: 10,
        startMinute: 0,
        endHour: 11,
        endMinute: 0,
      });

      expect(saveArg[1]).toMatchObject({
        userId: mockUserId,
        day: "tuesday",
        startHour: 14,
        startMinute: 30,
        endHour: 15,
        endMinute: 30,
      });

      expect(result).toEqual(expectedAvailabilities);
    });
  });

  describe("findOne", () => {
    it("should return an availability if found", async () => {
      const mockAvailability = new Availability({
        id: "avail-1",
        userId: mockUserId,
        day: "monday",
        startHour: 9,
        startMinute: 0,
        endHour: 10,
        endMinute: 0,
      });

      mockAvailabilityRepository.findOne.mockResolvedValue(mockAvailability);

      const result = await service.findOne("avail-1", mockUserId);
      expect(result).toEqual(mockAvailability);
      expect(mockAvailabilityRepository.findOne).toHaveBeenCalledWith({
        where: { id: "avail-1", user: { id: mockUserId } },
      });
    });

    it("should throw NotFoundException if availability not found", async () => {
      mockAvailabilityRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("non-existent", mockUserId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("remove", () => {
    it("should delete all availabilities for a user", async () => {
      await service.remove(mockUserId);
      expect(mockAvailabilityRepository.delete).toHaveBeenCalledWith({
        userId: mockUserId,
      });
    });
  });
});
