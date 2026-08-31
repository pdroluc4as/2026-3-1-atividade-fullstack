import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString({ message: 'O título da publicação deve ser uma string' })
  @IsNotEmpty({ message: 'O título da publicação não pode ser vazio' })
  @MinLength(1, { message: 'O título da publicação deve ter pelo menos 1 caractere' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'O conteúdo da publicação deve ser uma string' })
  @IsNotEmpty({ message: 'O conteúdo da publicação não pode ser vazio' })
  @MinLength(1, { message: 'O conteúdo da publicação deve ter pelo menos 1 caractere' })
  content?: string;
}
