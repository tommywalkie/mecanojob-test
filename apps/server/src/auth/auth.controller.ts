import { Controller, Post, Body, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common'
import { LoginDto, SignupDto, TokenDto } from './dtos'
import { AuthService } from './auth.service'
import { ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger'
import { User } from 'src/user/user.entity'

/**
 * Simple auth controller to handle login and signup
 */
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: TokenDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post('signup')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Signup a user' })
  @ApiBody({ type: SignupDto })
  @ApiOkResponse({ type: User })
  signup(@Body() signupDto: SignupDto): Promise<User> {
    return this.authService.signup(signupDto)
  }
}
