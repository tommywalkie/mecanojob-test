import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Availability } from './availability.entity'
import { User } from '../user/user.entity'
import { CreateAvailabilityDto, TimeSlotDto } from './dtos'

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ) {}

  async create(user: User, createAvailabilityDto: CreateAvailabilityDto): Promise<Availability[]> {
    // Delete existing availabilities for this user
    await this.availabilityRepository.delete({ userId: user.id })

    // Create new availabilities from the time slots
    const availabilities = createAvailabilityDto.timeSlots.map(
      (slot) =>
        new Availability({
          user,
          userId: user.id,
          day: slot.day,
          startHour: slot.startHour,
          startMinute: slot.startMinute,
          endHour: slot.endHour,
          endMinute: slot.endMinute,
        }),
    )

    return this.availabilityRepository.save(availabilities)
  }

  async findAll(userId: string): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { userId },
      order: { day: 'ASC', startHour: 'ASC', startMinute: 'ASC' },
    })
  }

  async findOne(id: string, userId: string): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({
      where: { id, user: { id: userId } },
    })
    if (!availability) {
      throw new NotFoundException('Availability not found')
    }
    return availability
  }

  async update(id: string, userId: string, updateAvailabilityDto: TimeSlotDto): Promise<Availability> {
    const availability = await this.findOne(id, userId)
    Object.assign(availability, updateAvailabilityDto)
    return this.availabilityRepository.save(availability)
  }

  async remove(userId: string): Promise<void> {
    await this.availabilityRepository.delete({ userId })
  }
}
