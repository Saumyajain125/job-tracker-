import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobtrack'),
    RedisModule,
    MailModule,
    UploadModule,
    AuthModule,
    JobsModule,
    ApplicationsModule,
    NotificationsModule,
    GatewayModule,
  ],
})
export class AppModule {}
