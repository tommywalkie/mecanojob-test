import { ApiProperty } from "@nestjs/swagger";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
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

@Entity({ name: "appointment" })
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty({ description: "Unique identifier of the appointment" })
  id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  @ApiProperty({ description: "User who owns this appointment slot" })
  user: User;

  @Column()
  @ApiProperty({ description: "Email of the person booking the appointment" })
  inviteeEmail: string;

  @Column()
  @ApiProperty({ description: "Start date and time of the appointment" })
  startDate: Date;

  @Column()
  @ApiProperty({ description: "End date and time of the appointment" })
  endDate: Date;

  @Column({
    type: "text",
    default: AppointmentStatus.PENDING,
  })
  @ApiProperty({
    description: "Status of the appointment",
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  @ApiProperty({
    description: "Notes added by the invitee",
    required: false,
    nullable: true,
  })
  notes: string;

  constructor(partial: Partial<Appointment>) {
    Object.assign(this, partial);
  }
}
