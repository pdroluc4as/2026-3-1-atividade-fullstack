import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UsersService } from './user.service.js';

@Module({
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
