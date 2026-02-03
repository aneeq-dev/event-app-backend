import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
    ) {
        this.seedDemoData();
    }

    async seedDemoData() {
        const count = await this.eventsRepository.count();
        if (count === 0) {
            const demoEvents = [
                {
                    title: 'F-6 Music Night',
                    description: 'Live performance in F-6 Islamabad',
                    location: 'F-6 Markaz, Islamabad',
                    latitude: 33.7297,
                    longitude: 73.0746,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 3600000),
                    isFeatured: true,
                },
                {
                    title: 'E-7 Food Festival',
                    description: 'Best street food in Islamabad',
                    location: 'E-7, Islamabad',
                    latitude: 33.7224,
                    longitude: 73.0487,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 7200000),
                    isFeatured: true,
                },
                {
                    title: 'Centaurus Tech Meetup',
                    description: 'Networking for tech enthusiasts',
                    location: 'Centaurus Mall, Islamabad',
                    latitude: 33.7077,
                    longitude: 73.0511,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 10800000),
                    isFeatured: false,
                },
            ];
            for (const data of demoEvents) {
                await this.create(data);
            }
            console.log('Demo events seeded successfully');
        }
    }

    create(eventData: Partial<Event>): Promise<Event> {
        const event = this.eventsRepository.create(eventData);
        return this.eventsRepository.save(event);
    }

    findAll(): Promise<Event[]> {
        return this.eventsRepository.find({ relations: ['organizer'] });
    }

    findOne(id: string): Promise<Event | null> {
        return this.eventsRepository.findOne({
            where: { id },
            relations: ['organizer', 'attendees', 'waitlist', 'polls', 'vouchers'],
        });
    }

    findFeatured(): Promise<Event[]> {
        return this.eventsRepository.find({
            where: { isFeatured: true },
            relations: ['organizer'],
        });
    }

    async findByBounds(north: number, south: number, east: number, west: number): Promise<Event[]> {
        return this.eventsRepository.createQueryBuilder('event')
            .where('event.latitude >= :south AND event.latitude <= :north', { south, north })
            .andWhere('event.longitude >= :west AND event.longitude <= :east', { west, east })
            .leftJoinAndSelect('event.organizer', 'organizer')
            .getMany();
    }

    async joinWaitlist(eventId: string, userId: string): Promise<any> {
        // TODO: Implement actual waitlist entity logic
        // For now, we'll mock the success
        /*
        const waitlistEntry = this.waitlistRepository.create({
            event: { id: eventId },
            user: { id: userId },
        });
        return this.waitlistRepository.save(waitlistEntry);
        */
        return { message: 'Joined waitlist successfully', position: 5 };
    }

    async leaveWaitlist(eventId: string, userId: string): Promise<any> {
        // TODO: Implement actual removal logic
        return { message: 'Left waitlist' };
    }
}
