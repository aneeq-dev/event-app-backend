import { Controller, Get, Patch, Param, UseGuards, Query, Body, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Patch(':id/approve')
    async approveOrganizer(@Param('id') id: string) {
        return this.usersService.update(id, { isApproved: true });
    }

    @Patch(':id/block')
    async blockUser(@Param('id') id: string, @Body('isBlocked') isBlocked: boolean) {
        // Prevent blocking self? Maybe handled in frontend or separate check.
        return this.usersService.update(id, { isBlocked });
    }

    @Patch(':id/role')
    async changeRole(@Param('id') id: string, @Body('role') role: UserRole) {
        return this.usersService.update(id, { role });
    }
}
