import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { PostService } from '../post/post.service.js';
import { CreateRatingDto } from './dto/create-rating.dto.js';
import { UpdateRatingDto } from './dto/update-rating.dto.js';
import { RatingService } from './rating.service.js';
import {Public} from "../auth/decorators/public.decorator.js"

@Controller('ratings')
export class RatingController {
  constructor(
    private readonly ratingService: RatingService,
    private readonly postService: PostService,
  ) {}

  @Public()
  @Get('post/:postId')
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.ratingService.findByPost(postId);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.ratingService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateRatingDto, @Req() req: Request) {
    const user = req.user as { sub?: number; id?: number; username?: string } | undefined;

    if (!user?.sub && !user?.id) {
      throw new UnauthorizedException('Usuário autenticado não encontrado');
    }

    const post = await this.postService.findById(data.postId);
    if (!post) {
      throw new ForbiddenException('O post informado não existe');
    }

    const userId = Number(user.sub ?? user.id);
    return this.ratingService.create({ ...data, userId });
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateRatingDto, @Req() req: Request) {
    const user = req.user as { sub?: number; id?: number } | undefined;
    const currentUserId = Number(user?.sub ?? user?.id);

    const rating = await this.ratingService.findById(id);
    if (!rating) {
      throw new ForbiddenException('Avaliação não encontrada');
    }

    if (rating.userId !== currentUserId) {
      throw new ForbiddenException('Você não pode editar esta avaliação');
    }

    return this.ratingService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { sub?: number; id?: number } | undefined;
    const currentUserId = Number(user?.sub ?? user?.id);

    const rating = await this.ratingService.findById(id);
    if (!rating) {
      throw new ForbiddenException('Avaliação não encontrada');
    }

    if (rating.userId !== currentUserId) {
      throw new ForbiddenException('Você não pode remover esta avaliação');
    }

    return this.ratingService.remove(id);
  }
}
