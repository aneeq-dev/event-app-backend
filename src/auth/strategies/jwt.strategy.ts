import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production';
        console.log('JwtStrategy Initialized with secret:', secret.substring(0, 4) + '...');
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        console.log('JwtStrategy Payload:', payload);
        return {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
        };
    }
}
