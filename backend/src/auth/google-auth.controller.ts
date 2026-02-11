import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAccountService } from '../email/google-account.service';

@Controller('auth')
export class GoogleAuthController {
  constructor(private readonly googleAccountService: GoogleAccountService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This will redirect to Google login
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Query('state') state: string) {
    // Handle Google callback
    const { user } = req;
    // Store user credentials in database
    // Redirect to frontend with success message
    return {
      success: true,
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }
}
