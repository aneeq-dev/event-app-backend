import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Organizer } from './organizer.entity';
import { User } from '../../users/entities/user.entity';
import { Waitlist, Poll, Voucher } from './extra.entities';
import { Message } from '../../chat/entities/message.entity';

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column()
    location: string;

    @Column('decimal', { precision: 10, scale: 7, nullable: true })
    latitude: number;

    @Column('decimal', { precision: 10, scale: 7, nullable: true })
    longitude: number;

    @Column()
    startTime: Date;

    @Column()
    endTime: Date;

    @Column({ default: false })
    isFeatured: boolean;

    @ManyToOne(() => Organizer, (organizer) => organizer.events)
    organizer: Organizer;

    @ManyToMany(() => User, (user) => user.events)
    attendees: User[];

    @OneToMany(() => Waitlist, (waitlist) => waitlist.event)
    waitlist: Waitlist[];

    @OneToMany(() => Message, (message) => message.event)
    chatMessages: Message[];

    @OneToMany(() => Poll, (poll) => poll.event)
    polls: Poll[];

    @OneToMany(() => Voucher, (voucher) => voucher.event)
    vouchers: Voucher[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
