import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ORGANIZER)
    create(@Body() data: Partial<Event>, @Request() req) {
        const user = req.user;
        if (!user.isApproved) {
            throw new ForbiddenException('Organizer account not approved yet');
        }
        if (!user.organizerProfile) {
            throw new ForbiddenException('Organizer profile not found');
        }

        // Associate event with organizer
        const eventData = {
            ...data,
            organizer: user.organizerProfile,
        };

        return this.eventsService.create(eventData);
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
