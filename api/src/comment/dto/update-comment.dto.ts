import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @IsString({ message: 'O conteúdo do comentário deve ser uma string' })
  @IsNotEmpty({ message: 'O conteúdo do comentário não pode ser vazio' })
  @MinLength(1, { message: 'O conteúdo do comentário deve ter pelo menos 1 caractere' })
  content?: string;

  @IsOptional()
  @IsString({ message: 'O comentário pai deve ser um número válido' })
  parentCommentId?: number | null;
}
