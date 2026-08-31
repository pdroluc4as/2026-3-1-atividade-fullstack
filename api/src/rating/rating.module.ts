import { Module } from '@nestjs/common';
import { PostModule } from '../post/post.module.js';
import { RatingController } from './rating.controller.js';
import { RatingService } from './rating.service.js';

@Module({
  imports: [PostModule],
  controllers: [RatingController],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}
