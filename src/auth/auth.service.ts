import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Organizer } from '../events/entities/organizer.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Organizer)
        private organizerRepository: Repository<Organizer>,
        private jwtService: JwtService,
        private usersService: UsersService,
    ) { }

    async register(userData: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        role?: UserRole;
    }): Promise<{ user: User; accessToken: string }> {
        // Check if user already exists
        const existingUser = await this.usersRepository.findOne({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new UnauthorizedException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user using UsersService (handles email verification)
        // If role is ORGANIZER, set isApproved to false
        const role = userData.role || UserRole.USER;
        const isApproved = role !== UserRole.ORGANIZER;

        const savedUser = await this.usersService.create({
            ...userData,
            password: hashedPassword,
            role,
            isApproved,
        });

        if (role === UserRole.ORGANIZER) {
            const organizer = this.organizerRepository.create({
                name: userData.name,
                email: userData.email,
                user: savedUser,
            });
            await this.organizerRepository.save(organizer);
        }

        // Generate JWT token
        const accessToken = this.generateToken(savedUser);

        // Remove password from response
        delete (savedUser as any).password;

        return { user: savedUser, accessToken };
    }

    async login(credentials: {
        email: string;
        password: string;
    }): Promise<{ user: User; accessToken: string }> {
        const user = await this.usersRepository.findOne({
            where: { email: credentials.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const accessToken = this.generateToken(user);

        // Remove password from response
        delete (user as any).password;

        return { user, accessToken };
    }

    async validateUser(userId: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['badges', 'followed', 'organizerProfile'],
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        delete (user as any).password;
        return user;
    }

    async refreshToken(userId: string): Promise<{ accessToken: string }> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const accessToken = this.generateToken(user);
        return { accessToken };
    }

    private generateToken(user: User): string {
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
        };

        return this.jwtService.sign(payload);
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const user = await this.usersRepository.findOne({ where: { email } });

        if (!user) {
            // Don't reveal if user exists
            return { message: 'If the email exists, a reset link has been sent' };
        }

        // TODO: Implement email sending logic
        // For now, just return success message
        return { message: 'If the email exists, a reset link has been sent' };
    }

    async resetPassword(
        userId: string,
        newPassword: string,
    ): Promise<{ message: string }> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await this.usersRepository.save(user);

        return { message: 'Password reset successfully' };
    }

    async verifyEmail(email: string, code: string): Promise<{ message: string }> {
        const isValid = await this.usersService.verifyUser(email, code);
        if (!isValid) {
            throw new BadRequestException('Invalid or expired verification code');
        }
        return { message: 'Email verified successfully' };
    }

    async initiatePasswordChange(userId: string): Promise<{ message: string }> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const code = Math.floor(1000 + Math.random() * 9000).toString();
        user.verificationCode = code;
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        user.verificationExpiresAt = expiresAt;

        await this.usersRepository.save(user);

        // Send email (assuming existing sendVerificationEmail can be reused or similar)
        // Ideally, create a specific template for Password Reset, but for NOW, reusing verification
        // Modify EmailService later to support custom subjects/templates or use current one.
        // Let's us sendVerificationEmail for now, as it sends a code.
        await this.usersService['emailService'].sendVerificationEmail(user.email, code);

        return { message: 'Verification code sent to email' };
    }

    async verifyPasswordChange(userId: string, code: string): Promise<{ tempToken: string }> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user || user.verificationCode !== code) {
            throw new BadRequestException('Invalid code');
        }

        if (user.verificationExpiresAt && user.verificationExpiresAt < new Date()) {
            throw new BadRequestException('Code expired');
        }

        // Clear code
        user.verificationCode = null;
        user.verificationExpiresAt = null;
        await this.usersRepository.save(user);

        // Issue a short-lived token specifically for password reset
        const payload = { sub: user.id, scope: 'password_reset' };
        // Valid for only 10 minutes
        const tempToken = this.jwtService.sign(payload, { expiresIn: '10m' });

        return { tempToken };
    }

    async completePasswordChange(userId: string, newPassword: string): Promise<{ message: string }> {
        // This method assumes the caller has already validated the tempToken guard
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await this.usersRepository.save(user);

        return { message: 'Password changed successfully' };
    }
}

