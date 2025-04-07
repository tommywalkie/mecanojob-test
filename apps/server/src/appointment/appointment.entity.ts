import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../user/user.entity";

export enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELED = "canceled",
  COMPLETED = "completed",
}

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Owner relationship
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  // Invitee information
  @Column()
  inviteeEmail: string;

  @Column({ nullable: true })
  inviteeName: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: "text",
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  constructor(partial: Partial<Appointment>) {
    Object.assign(this, partial);
  }
}
