import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private emailService: EmailService,
    ) { }

    async create(userData: Partial<User>): Promise<User> {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        const user = this.usersRepository.create({
            ...userData,
            verificationCode: code,
            verificationExpiresAt: expiresAt,
            isVerified: false,
        });

        const savedUser = await this.usersRepository.save(user);

        if (savedUser.email) {
            await this.emailService.sendVerificationEmail(savedUser.email, code);
        }

        return savedUser;
    }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    findOne(id: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { id },
            relations: ['badges', 'followed'],
        });
    }

    findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async verifyUser(email: string, code: string): Promise<boolean> {
        const user = await this.findOneByEmail(email);
        if (!user || user.verificationCode !== code) {
            return false;
        }

        if (user.verificationExpiresAt && user.verificationExpiresAt < new Date()) {
            return false; // Expired
        }

        user.isVerified = true;
        user.verificationCode = null; // Clear code after usage
        user.verificationExpiresAt = null;
        await this.usersRepository.save(user);
        return true;
    }

    async update(id: string, updateData: Partial<User>): Promise<User> {
        await this.usersRepository.update(id, updateData);
        const user = await this.findOne(id);
        if (!user) {
            throw new Error('User not found after update');
        }
        return user;
    }
}
