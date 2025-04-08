import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../user/user.entity'

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  userId: string

  @Column()
  day: string // 'monday', 'tuesday', etc.

  @Column()
  startHour: number

  @Column()
  startMinute: number

  @Column()
  endHour: number

  @Column()
  endMinute: number

  constructor(partial: Partial<Availability>) {
    Object.assign(this, partial)
  }
}
