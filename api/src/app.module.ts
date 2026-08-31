import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { CommentModule } from './comment/comment.module.js';
import { DrizzleModule } from './db/drizzle.module.js';
import { PostModule } from './post/post.module.js';
import { RatingModule } from './rating/rating.module.js';
import { UserModule } from './user/user.module.js';

@Module({
  imports: [DrizzleModule, AuthModule, UserModule, PostModule, CommentModule, RatingModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
