import { Module } from '@nestjs/common';
import { PostModule } from '../post/post.module.js';
import { CommentController } from './comment.controller.js';
import { CommentService } from './comment.service.js';

@Module({
  imports: [PostModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
