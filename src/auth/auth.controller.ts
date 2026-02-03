import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(
        @Body()
        body: {
            email: string;
            password: string;
            name: string;
            phone?: string;
        },
    ) {
        return this.authService.register(body);
    }

    @Post('verify')
    async verify(
        @Body() body: { email: string; code: string },
    ) {
        return this.authService.verifyEmail(body.email, body.code);
    }

    @Post('login')
    async login(
        @Body() body: { email: string; password: string },
    ) {
        return this.authService.login(body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Request() req) {
        console.log('GET /auth/me Request User:', req.user);
        return this.authService.validateUser(req.user.sub);
    }

    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    async refresh(@Request() req) {
        return this.authService.refreshToken(req.user.sub);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: { email: string }) {
        return this.authService.forgotPassword(body.email);
    }

    @UseGuards(JwtAuthGuard)
    @Post('reset-password')
    async resetPassword(
        @Request() req,
        @Body() body: { newPassword: string },
    ) {
        return this.authService.resetPassword(req.user.sub, body.newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password/initiate')
    async initiatePasswordChange(@Request() req) {
        return this.authService.initiatePasswordChange(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password/verify')
    async verifyPasswordChange(@Request() req, @Body() body: { code: string }) {
        return this.authService.verifyPasswordChange(req.user.sub, body.code);
    }

    // Note: In real world, this endpoint should be protected by a special Strategy that validates the 'tempToken'
    // For simplicity here, we might just pass the tempToken in the header and validate it manually or reuse JwtAuthGuard if we can differentiate.
    // However, the standard JwtAuthGuard validates the ACCESS token.
    // To allow the "change password" screen to work, the user is likely STILL logged in with their Access Token when they reach this step?
    // User flow:
    // 1. Logged in (Access Token) -> Click Change Password
    // 2. Initiate -> Email Sent.
    // 3. Verify -> Access Token + Code -> Returns Temp Token? OR simple success?
    // If user is ALREADY logged in, we technically know who they are.
    // The verification step is to prove they HAVE access to the email right now (2FAish).
    // So:
    // Verify returns Success.
    // Complete -> Access Token + New Password.
    // BUT we need to ensure they actually verified the code recently.
    // The "tempToken" approach allows us to verify that.
    // Let's make "complete" take the tempToken in the BODY or a specific Header, decode it, and use that ID.
    // OR create a custom Guard for this.
    // Let's go with: Client sends tempToken in BODY. We verify it in Service manually for simplicity.
    @Post('change-password/complete')
    async completePasswordChange(@Body() body: { tempToken: string; newPassword: string }) {
        // We verify the token manually here
        try {
            const payload = this.authService['jwtService'].verify(body.tempToken);
            if (payload.scope !== 'password_reset') throw new Error('Invalid scope');
            return this.authService.completePasswordChange(payload.sub, body.newPassword);
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }
    }
}
