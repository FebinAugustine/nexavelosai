import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    console.log('JWT_SECRET in strategy:', process.env.JWT_SECRET);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'test-secret',
    });
  }

  async validate(payload: any) {
    console.log('JWT Validate called with payload:', payload);
    try {
      const user = await this.authService.getProfile(payload.sub);
      console.log('User found:', user ? user.email : 'null');
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (error) {
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
