import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/users.schema';
import { Agent, AgentSchema } from '../agents/agents.schema';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { AgentsModule } from '../agents/agents.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Agent.name, schema: AgentSchema }]),
    AuthModule,
    AgentsModule,
    PaymentsModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
