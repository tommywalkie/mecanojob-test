import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { RequiredKeys } from 'src/utils'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(user: RequiredKeys<Partial<User>, 'email' | 'password'>): Promise<User> {
    return this.userRepository.save(new User(user))
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find()
  }

  getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } })
  }

  getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } })
  }

  async getUser(params: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: params })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  async updateUser(id: string, user: User): Promise<User> {
    const existingUser = await this.getUserById(user.id)
    if (!existingUser) {
      throw new NotFoundException('User not found')
    }
    return this.userRepository.save({ ...user, id })
  }

  async patchUser(id: string, user: User): Promise<User> {
    const existingUser = await this.getUserById(user.id)
    if (!existingUser) {
      throw new NotFoundException('User not found')
    }
    return this.userRepository.save({ ...existingUser, ...user, id })
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.getUserById(id)
    if (!existingUser) {
      throw new NotFoundException('User not found')
    }
    await this.userRepository.delete(id)
  }
}
