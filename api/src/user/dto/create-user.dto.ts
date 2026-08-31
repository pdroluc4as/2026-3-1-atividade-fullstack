import { IsOptional, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'O nome de usuário deve ser uma string' })
  @IsNotEmpty({ message: 'O nome de usuário não pode ser vazio' })
  @MinLength(3, { message: 'O nome de usuário deve ter pelo menos 3 caracteres' })
  username: string;

  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha não pode ser vazia' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @IsString({ message: 'O nome completo deve ser uma string' })
  @IsNotEmpty({ message: 'O nome completo não pode ser vazio' })
  @MinLength(2, { message: 'O nome completo deve ter pelo menos 2 caracteres' })
  fullName: string;

  @IsOptional()
  @IsString({ message: 'A bio deve ser uma string' })
  bio?: string | null;
}