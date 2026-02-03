import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from '../events/entities/extra.entities';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class LiveService {
    constructor(
        @InjectRepository(Poll)
        private pollRepository: Repository<Poll>,
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
    ) { }

    async triggerSOS(userId: string, eventId: string, location: { lat: number; lng: number }) {
        // In a real app, this would send an SMS, Email, or Push Notification to venue security.
        console.log(`🚨 SOS Triggered by user ${userId} at event ${eventId}. Location: ${location.lat}, ${location.lng}`);
        return { status: 'Alerted', message: 'Venue security has been notified of your location.' };
    }

    async createPoll(eventId: string, question: string, options: string[]) {
        const poll = this.pollRepository.create({
            question,
            options,
            event: { id: eventId } as Event,
        });
        return this.pollRepository.save(poll);
    }

    async getPolls(eventId: string) {
        return this.pollRepository.find({
            where: { event: { id: eventId } },
            order: { createdAt: 'DESC' },
        });
    }
}
