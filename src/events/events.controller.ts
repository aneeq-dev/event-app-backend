import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    create(@Body() data: Partial<Event>) {
        return this.eventsService.create(data);
    }

    @Get()
    findAll() {
        return this.eventsService.findAll();
    }

    @Get('nearby')
    findNearby(
        @Query('north') north: string,
        @Query('south') south: string,
        @Query('east') east: string,
        @Query('west') west: string,
    ) {
        return this.eventsService.findByBounds(
            parseFloat(north),
            parseFloat(south),
            parseFloat(east),
            parseFloat(west),
        );
    }

    @Get('featured')
    findFeatured() {
        return this.eventsService.findFeatured();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Post(':id/waitlist')
    joinWaitlist(@Param('id') id: string, @Body('userId') userId: string) {
        return this.eventsService.joinWaitlist(id, userId);
    }

    @Post(':id/waitlist/leave')
    leaveWaitlist(@Param('id') id: string, @Body('userId') userId: string) {
        return this.eventsService.leaveWaitlist(id, userId);
    }
}
