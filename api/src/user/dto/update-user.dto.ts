import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'O nome de usuário deve ser uma string' })
  @MinLength(3, { message: 'O nome de usuário deve ter pelo menos 3 caracteres' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'O nome completo deve ser uma string' })
  @MinLength(2, { message: 'O nome completo deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'O nome completo deve ter no máximo 100 caracteres' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: 'A bio deve ser uma string' })
  @MaxLength(250, { message: 'A bio deve ter no máximo 250 caracteres' })
  bio?: string | null;
}
