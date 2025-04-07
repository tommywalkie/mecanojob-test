import { ApiProperty } from "@nestjs/swagger";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../user/user.entity";

@Entity({ name: "availability" })
export class Availability {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty({ description: "Unique identifier of the availability" })
  id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  @ApiProperty({ description: "User who created this availability" })
  user: User;

  @Column()
  @ApiProperty({ description: "The day of the week (0-6, where 0 is Sunday)" })
  day: number;

  @Column()
  @ApiProperty({ description: "Starting hour in 24h format (0-23)" })
  startHour: number;

  @Column()
  @ApiProperty({ description: "Starting minute (0-59)" })
  startMinute: number;

  @Column()
  @ApiProperty({ description: "Duration in minutes" })
  durationMinutes: number;

  @Column({ nullable: true })
  @ApiProperty({
    description: "Optional instructions for the meeting",
    required: false,
    nullable: true,
  })
  instructions: string;

  constructor(partial: Partial<Availability>) {
    Object.assign(this, partial);
  }
}
