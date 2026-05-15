import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegistrationDto } from './user-registration.dto';
import { JwtGuard } from './jwtGuard.guard';
import { RolesGuard } from './roles/roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '../users/users.entity';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';
import { User } from '../users/users.entity';
import { PasswordResetService } from './password-reset.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}
  @Post('register')
  @Public()
  async register(@Body() userRegistrationDto: UserRegistrationDto) {
    return this.authService.registerUser(userRegistrationDto);
  }
  @Post('login')
  @Public()
  async login(@Body() loginDto) {
    return this.authService.login(loginDto);
  }

  @Get('current-user')
  @Roles(Role.ADMIN, Role.MEMBER)
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Get('email')
  @Roles(Role.ADMIN, Role.MEMBER)
  getEmail(@CurrentUser('email') email: string) {
    return { email };
  }

  @Get('all-users')
  @Roles(Role.ADMIN)
  async getAllUsers() {
    return this.authService.findAllUsers();
  }

  @Get('user/:id')
  @Roles(Role.ADMIN)
  async getUserById(@Param('id') id: number) {
    return this.authService.findUserById(id);
  }
  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      await this.passwordResetService.requestPasswordReset(
        forgotPasswordDto.email,
      );
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to process password reset request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      await this.passwordResetService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
      return { message: 'Password reset successfully' };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to reset password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('validate-reset-token')
  @Public()
  async validateResetToken(@Body('token') token: string) {
    try {
      const result = await this.passwordResetService.validateResetToken(token);
      return { email: result.email };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Invalid token',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
