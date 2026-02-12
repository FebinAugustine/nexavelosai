import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('JwtAuthGuard canActivate called');

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Skip authentication entirely for public routes
      return true;
    }

    // For non-public routes, proceed with authentication
    try {
      return (await super.canActivate(context)) as boolean;
    } catch (error) {
      throw error;
    }
  }

  handleRequest(err, user, info, context, status) {
    console.log('JwtAuthGuard handleRequest: err', err);
    console.log('JwtAuthGuard handleRequest: user', user);
    console.log('JwtAuthGuard handleRequest: info', info);
    console.log('JwtAuthGuard handleRequest: context', context);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // If it's a public route, and there's an error (e.g., no token) or no user, don't throw, just return null user.
      // This will allow req.user to be null/undefined, but the request still proceeds.
      if (err || !user) {
        return null;
      }
    } else if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
