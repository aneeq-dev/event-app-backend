import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ChatModule } from './chat/chat.module';
import { User } from './users/entities/user.entity';
import { Badge } from './users/entities/badge.entity';
import { Event } from './events/entities/event.entity';
import { Organizer } from './events/entities/organizer.entity';
import { Waitlist, Poll, Voucher } from './events/entities/extra.entities';
import { Message } from './chat/entities/message.entity';
import { LiveModule } from './live/live.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '72.60.40.78',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'eventapp',
      password: process.env.DB_PASSWORD || 'eventapp',
      database: process.env.DB_NAME || 'eventapp',
      schema: "public", // Ensure this is specified
      entities: [User, Badge, Event, Organizer, Waitlist, Poll, Voucher, Message],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    ChatModule,
    LiveModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
