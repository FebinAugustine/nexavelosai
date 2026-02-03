import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Billing, BillingSchema } from './billing.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register(),
    MongooseModule.forFeature([{ name: Billing.name, schema: BillingSchema }]),
    UsersModule,
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
