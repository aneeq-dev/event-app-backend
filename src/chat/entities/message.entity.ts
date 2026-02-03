import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    content: string;

    @ManyToOne(() => User, (user) => user.messages)
    author: User;

    @ManyToOne(() => Event, (event) => event.chatMessages, { nullable: true })
    event: Event;

    @ManyToOne(() => User, { nullable: true })
    recipient: User;

    @CreateDateColumn()
    createdAt: Date;
}
