import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Badge } from './badge.entity';
import { Event } from '../../events/entities/event.entity';
import { Organizer } from '../../events/entities/organizer.entity';
import { Message } from '../../chat/entities/message.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    verificationCode: string | null;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ type: 'timestamp', nullable: true })
    verificationExpiresAt: Date | null;

    @OneToMany(() => Badge, (badge) => badge.user)
    badges: Badge[];

    @ManyToMany(() => Event, (event) => event.attendees)
    @JoinTable()
    events: Event[];

    @ManyToMany(() => Organizer, (organizer) => organizer.followers)
    @JoinTable()
    followed: Organizer[];

    @OneToMany(() => Message, (message) => message.author)
    messages: Message[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
