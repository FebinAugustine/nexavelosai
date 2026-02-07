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

    try {
      // Always attempt authentication. Let handleRequest decide whether to throw for non-public routes.
      return (await super.canActivate(context)) as boolean;
    } catch (error) {
      if (isPublic && error instanceof UnauthorizedException) {
        // If it's a public route and authentication failed (e.g., no token),
        // we still allow access, but req.user will be null/undefined.
        return true;
      }
      throw error; // Re-throw other errors or Unauthorized for non-public routes
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
