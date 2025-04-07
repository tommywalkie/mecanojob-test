import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: "Email of the user" })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: "Password of the user" })
  password: string;
}

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: "Email of the user" })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: "Password of the user" })
  password: string;

  @IsNotEmpty()
  @ApiProperty({ description: "First name of the user" })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({ description: "Last name of the user" })
  lastName: string;

  @IsOptional()
  @ApiProperty({ description: "Phone number of the user", required: false })
  phone: string;
}
