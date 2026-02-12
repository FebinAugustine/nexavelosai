import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Redirect,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAccountService } from '../email/google-account.service';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-google-oauth20';
import { Public } from './public.decorator';

@Controller('auth')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(
    private readonly googleAccountService: GoogleAccountService,
    private readonly authService: AuthService,
  ) {}

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Query('token') token: string, @Request() req) {
    this.logger.log('GoogleAuthController googleAuth called');
    this.logger.log('Token:', token);
    // The Passport strategy will automatically handle the redirect
    // The state is already configured in GoogleStrategy with state: true
  }

  @Get('gmail/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @Redirect('http://localhost:3000/dashboard/email-automation/accounts', 302)
  async googleAuthRedirect(@Request() req, @Query('state') state: string) {
    this.logger.log('GoogleAuthController googleAuthRedirect called');
    this.logger.log('State:', state);
    this.logger.log('Request user:', req.user);
    this.logger.log('Request:', req);

    try {
      // Handle Google callback
      const { user } = req;

      // Validate the token from state
      const decoded = await this.authService.decodeToken(state);
      if (!decoded) {
        // Redirect to error page if token is invalid
        this.logger.error('Invalid token');
        return {
          url: 'http://localhost:3000/dashboard/email-automation/accounts?error=invalid_token',
        };
      }

      this.logger.log('Decoded token:', decoded);

      // Store user credentials in database
      await this.googleAccountService.connect(decoded.sub, {
        email: user.email,
        name: user.name,
        picture: user.picture,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      });

      this.logger.log('Google account connected successfully');

      // Redirect to frontend with success message
      return {
        url: 'http://localhost:3000/dashboard/email-automation/accounts?connected=true',
      };
    } catch (error) {
      this.logger.error('Error in googleAuthRedirect:', error);
      return {
        url: 'http://localhost:3000/dashboard/email-automation/accounts?error=server_error',
      };
    }
  }

  @Get('test-callback')
  @Public()
  async testCallback(@Query('state') state: string) {
    this.logger.log('Test callback received state:', state);
    return { message: 'Callback test successful', state };
  }
}
