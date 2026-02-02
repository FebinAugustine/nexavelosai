import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to not throw an error if the user is not found.
  // It returns the user object if authentication is successful, otherwise null.
  // This allows the request to proceed in either case.
  handleRequest(err, user, info, context) {
    return user;
  }
}
