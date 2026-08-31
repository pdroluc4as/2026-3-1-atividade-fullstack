import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { PostService } from '../post/post.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { CommentService } from './comment.service.js';

@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostService,
  ) {}

  @Get()
  findAll(@Query('postId') postId?: string) {
    if (postId === undefined || postId === null || postId === '') {
      return this.commentService.findAll();
    }

    const parsedPostId = Number(postId);
    if (Number.isNaN(parsedPostId)) {
      throw new ForbiddenException('O id do post deve ser um número válido');
    }

    return this.commentService.findByPost(parsedPostId);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findById(id);
  }

  @Post()
  async create(@Body() data: CreateCommentDto, @Req() req: Request) {
    const user = req.user as { sub?: number; id?: number; username?: string } | undefined;

    if (!user?.sub && !user?.id) {
      throw new UnauthorizedException('Usuário autenticado não encontrado');
    }

    const post = await this.postService.findById(data.postId);
    if (!post) {
      throw new ForbiddenException('O post informado não existe');
    }

    const authorId = Number(user.sub ?? user.id);
    return this.commentService.create({ ...data, authorId });
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCommentDto, @Req() req: Request) {
    const user = req.user as { sub?: number; id?: number } | undefined;
    const currentUserId = Number(user?.sub ?? user?.id);

    const comment = await this.commentService.findById(id);
    if (!comment) {
      throw new ForbiddenException('Comentário não encontrado');
    }

    if (comment.authorId !== currentUserId) {
      throw new ForbiddenException('Você não pode editar este comentário');
    }

    return this.commentService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { sub?: number; id?: number } | undefined;
    const currentUserId = Number(user?.sub ?? user?.id);

    const comment = await this.commentService.findById(id);
    if (!comment) {
      throw new ForbiddenException('Comentário não encontrado');
    }

    if (comment.authorId !== currentUserId) {
      throw new ForbiddenException('Você não pode remover este comentário');
    }

    return this.commentService.remove(id);
  }
}
