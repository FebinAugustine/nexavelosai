import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
  ValidationPipe,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyDto } from './dto/verify.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotDto } from './dto/forgot.dto';
import { ResetDto } from './dto/reset.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    await this.authService.register(registerDto.email, registerDto.password);
    return {
      message:
        'Registration successful. Please check your email for verification code.',
    };
  }

  @Post('verify')
  async verify(@Body(ValidationPipe) verifyDto: VerifyDto) {
    await this.authService.verifyEmail(verifyDto.email, verifyDto.code);
    return { message: 'Email verified successfully.' };
  }

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body(ValidationPipe) forgotDto: ForgotDto) {
    await this.authService.forgotPassword(forgotDto.email);
    return { message: 'Password reset email sent.' };
  }

  @Post('reset-password')
  async resetPassword(@Body(ValidationPipe) resetDto: ResetDto) {
    await this.authService.resetPassword(resetDto.token, resetDto.newPassword);
    return { message: 'Password reset successfully.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log('getProfile called, user:', req.user);
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Body() updateData: any, @Request() req) {
    return this.authService.updateProfile(req.user.sub, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Body(ValidationPipe) changePasswordDto: ChangePasswordDto, @Request() req) {
    console.log('changePassword called, user:', req.user);
    await this.authService.changePassword(req.user._id.toString(), changePasswordDto.currentPassword, changePasswordDto.newPassword);
    return { message: 'Password changed successfully.' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  async deleteAccount(@Body(ValidationPipe) deleteAccountDto: DeleteAccountDto, @Request() req) {
    await this.authService.deleteAccount(req.user.sub);
    return { message: 'Account deleted successfully.' };
  }
}
