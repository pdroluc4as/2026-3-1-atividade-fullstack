import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @Type(() => Number)
  @IsInt({ message: 'O id do post deve ser um número inteiro' })
  @IsPositive({ message: 'O id do post deve ser positivo' })
  postId: number;

  @IsOptional()
  @Type(() => Number)
  authorId?: number;

  @IsString({ message: 'O conteúdo do comentário deve ser uma string' })
  @IsNotEmpty({ message: 'O conteúdo do comentário não pode ser vazio' })
  @MinLength(1, { message: 'O conteúdo do comentário deve ter pelo menos 1 caractere' })
  content: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O id do comentário pai deve ser um número inteiro' })
  @IsPositive({ message: 'O id do comentário pai deve ser positivo' })
  parentCommentId?: number | null;
}
