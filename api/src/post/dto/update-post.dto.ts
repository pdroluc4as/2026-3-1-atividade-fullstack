import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePostDto {
  @IsString({ message: 'O conteúdo da publicação deve ser uma string' })
  @IsNotEmpty({ message: 'O conteúdo da publicação não pode ser vazio' })
  @MinLength(1, { message: 'O conteúdo da publicação deve ter pelo menos 1 caractere' })
  content: string;
}
