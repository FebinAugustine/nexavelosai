import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/users.schema';
import { Agent, AgentSchema } from '../agents/agents.schema';
import { Team, TeamSchema } from '../teams/teams.schema';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { AgentsModule } from '../agents/agents.module';
import { PaymentsModule } from '../payments/payments.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: Team.name, schema: TeamSchema },
    ]),
    AuthModule,
    AgentsModule,
    PaymentsModule,
    TeamsModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
