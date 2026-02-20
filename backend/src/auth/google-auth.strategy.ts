import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:5000/auth/gmail/callback',
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/gmail.send'],
      passReqToCallback: true,
      accessType: 'offline', // THIS IS CRITICAL - Ensures we get a refresh token
      prompt: 'consent', // Forces re-consent to ensure refresh token is always issued
      includeGrantedScopes: true,
    } as any);
    this.logger.log('GoogleStrategy initialized');
  }

  async authenticate(req: any, options: any) {
    this.logger.log('GoogleStrategy authenticate called');
    this.logger.log('Request query:', req.query);
    this.logger.log('Request headers:', req.headers);

    // Set the state parameter to the token from the query string
    if (req.query.token) {
      options.state = req.query.token;
      this.logger.log('Setting state to token:', options.state);
    }

    // Ensure we preserve the configured accessType and prompt to get refresh token
    options.accessType = 'offline';
    options.prompt = 'consent';

    this.logger.log(
      'Authentication options with refresh token config:',
      options,
    );
    super.authenticate(req, options);
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    this.logger.log('GoogleStrategy validate called');
    this.logger.log('Profile:', profile);
    this.logger.log('Access token:', accessToken);
    this.logger.log('Refresh token:', refreshToken);
    this.logger.log('Request user:', req.user);
    this.logger.log('Request query:', req.query);

    try {
      const { id, name, emails, photos } = profile;
      const user: any = {
        googleId: id,
        email: emails[0].value,
        name: `${name.givenName} ${name.familyName}`,
        picture: photos[0].value,
        accessToken,
        refreshToken,
      };

      // Check if state parameter contains token
      if (req.query.state) {
        user.token = req.query.state;
      }

      // If there's a user object in the request (from JWT auth), use it
      if (req.user) {
        user.userId = req.user._id;
      }

      this.logger.log('Created user object:', user);
      done(null, user);
    } catch (error) {
      this.logger.error('Error in GoogleStrategy validate:', error);
      done(error, undefined);
    }
  }
}
