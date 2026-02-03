import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveService } from './live.service';
import { LiveController } from './live.controller';
import { Poll } from '../events/entities/extra.entities';
import { Event } from '../events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, Event])],
  providers: [LiveService],
  controllers: [LiveController],
})
export class LiveModule { }
