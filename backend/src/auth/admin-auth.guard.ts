import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserDocument } from '../users/users.schema';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserDocument = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required for this route.');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Admin access required.');
    }

    return true;
  }
}
