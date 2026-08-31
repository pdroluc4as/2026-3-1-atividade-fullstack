import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @Type(() => Number)
  @IsInt({ message: 'O id do post deve ser um número inteiro' })
  @IsPositive({ message: 'O id do post deve ser positivo' })
  postId: number;

  @IsOptional()
  @Type(() => Number)
  userId?: number;

  @Type(() => Number)
  @IsInt({ message: 'A avaliação deve ser um número inteiro' })
  @Min(1, { message: 'A avaliação deve ser no mínimo 1' })
  @Max(5, { message: 'A avaliação deve ser no máximo 5' })
  rating: number;
}
