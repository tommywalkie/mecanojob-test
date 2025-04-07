import { ApiProperty } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from "class-transformer";

@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty({ description: "Unique identifier of the user" })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: "Email of the user" })
  email: string;

  @Column()
  @ApiProperty({ description: "Password of the user" })
  @Exclude()
  password: string;

  @Column()
  @ApiProperty({ description: "First name of the user" })
  firstName: string;

  @Column()
  @ApiProperty({ description: "Last name of the user" })
  lastName: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: "Phone number of the user",
    required: false,
    nullable: true,
  })
  phone: string;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
