import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Organizer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @OneToMany(() => Event, (event) => event.organizer)
    events: Event[];

    @ManyToMany(() => User, (user) => user.followed)
    followers: User[];

    @OneToOne(() => User, (user) => user.organizerProfile)
    @JoinColumn()
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
