import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UnauthorizedException, ForbiddenException, Query } from '@nestjs/common';
import type { Request } from 'express';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostService } from './post.service.js';
import {Public} from "../auth/decorators/public.decorator.js"

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Public()
  @Get()
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.postService.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findById(id);
  }

  @Post()
  create(@Body() data: CreatePostDto, @Req() req: Request) {
    const user = req.user as { sub?: number; id?: number; username?: string } | undefined;

    if (!user?.sub && !user?.id) {
      throw new UnauthorizedException('Usuário autenticado não encontrado');
    }

    const authorId = Number(user.sub ?? user.id);
    return this.postService.create({ ...data, authorId });
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdatePostDto, @Req() req: Request) {
    const user = req.user as { sub?: number; id?: number } | undefined;
    const currentUserId = Number(user?.sub ?? user?.id);

    const post = await this.postService.findById(id);
    if (!post) {
      throw new ForbiddenException('Publicação não encontrada');
    }

    if (post.authorId !== currentUserId) {
      throw new ForbiddenException('Você não pode editar esta publicação');
    }

    return this.postService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { sub?: number; id?: number } | undefined;
    const currentUserId = Number(user?.sub ?? user?.id);

    const post = await this.postService.findById(id);
    if (!post) {
      throw new ForbiddenException('Publicação não encontrada');
    }

    if (post.authorId !== currentUserId) {
      throw new ForbiddenException('Você não pode remover esta publicação');
    }

    return this.postService.remove(id);
  }
}
