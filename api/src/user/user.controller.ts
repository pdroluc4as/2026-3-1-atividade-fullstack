import { Body, Controller, Get, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './user.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = req.user as { sub?: number; id?: number } | undefined;
    const currentUserId = Number(user?.sub ?? user?.id);

    if (currentUserId !== id) {
      throw new Error('Você só pode editar seu próprio perfil');
    }

    return this.userService.updateUser(id, updateUserDto);
  }
}
