import { Module, forwardRef } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    CacheModule.register(),
    UsersModule,
    MailModule,
    forwardRef(() => AgentsModule),
    PassportModule,
    JwtModule.register({
      secret:
        '6437c8cd3f8e2dae772934d61d42eda8b399c71dc363d320a2611456c58e68b5',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
