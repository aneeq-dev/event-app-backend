import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class Waitlist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userEmail: string;

    @ManyToOne(() => Event, (event) => event.waitlist)
    event: Event;

    @CreateDateColumn()
    createdAt: Date;
}

@Entity()
export class Poll {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    question: string;

    @Column('simple-array')
    options: string[];

    @ManyToOne(() => Event, (event) => event.polls)
    event: Event;

    @CreateDateColumn()
    createdAt: Date;
}

@Entity()
export class Voucher {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    pdfUrl: string;

    @ManyToOne(() => Event, (event) => event.vouchers)
    event: Event;
}
