import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { LiveService } from './live.service';

@Controller('live')
export class LiveController {
    constructor(private readonly liveService: LiveService) { }

    @Post('sos')
    triggerSOS(
        @Body() data: { userId: string; eventId: string; location: { lat: number; lng: number } },
    ) {
        return this.liveService.triggerSOS(data.userId, data.eventId, data.location);
    }

    @Post('polls')
    createPoll(@Body() data: { eventId: string; question: string; options: string[] }) {
        return this.liveService.createPoll(data.eventId, data.question, data.options);
    }

    @Get('polls/:eventId')
    getPolls(@Param('eventId') eventId: string) {
        return this.liveService.getPolls(eventId);
    }
}
