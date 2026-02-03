import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { Organizer } from './entities/organizer.entity';
import { Waitlist, Poll, Voucher } from './entities/extra.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Organizer, Waitlist, Poll, Voucher])],
  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule { }
