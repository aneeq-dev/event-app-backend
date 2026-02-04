import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Badge } from './entities/badge.entity';

import { EmailModule } from '../email/email.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Badge]), EmailModule],
  providers: [UsersService],
  controllers: [UsersController, AdminController],
  exports: [UsersService],
})
export class UsersModule { }
