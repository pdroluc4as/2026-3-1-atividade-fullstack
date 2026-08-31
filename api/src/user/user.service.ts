import { Inject, Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module.js';
import { usersTable } from '../db/schema.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  private generateDiceBearAvatarUrl(username: string) {
    const seed = `${username}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
  }

  async findAll() {
    return this.db.select().from(usersTable).all();
  }

  async findById(id: number) {
    return this.db.select().from(usersTable).where(eq(usersTable.id, id)).get();
  }

  async findByUsername(username: string) {
    return this.db.select().from(usersTable).where(eq(usersTable.username, username)).get();
  }

  async createUser(createUserDto: CreateUserDto) {
    const { username, password, fullName, bio } = createUserDto;

    const existingUser = await this.findByUsername(username);

    if (existingUser) {
      throw new ConflictException('Nome de usuário já está em uso');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatarUrl = this.generateDiceBearAvatarUrl(username);

    const newUser = await this.db
      .insert(usersTable)
      .values({
        username,
        passwordHash: hashedPassword,
        fullName,
        bio: bio ?? null,
        avatarUrl,
        createdAt: new Date(),
      })
      .returning();

    const { passwordHash: _, ...userWithoutPassword } = newUser[0];
    return userWithoutPassword;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.findByUsername(updateUserDto.username);

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Nome de usuário já está em uso');
      }
    }

    const updated = await this.db
      .update(usersTable)
      .set({
        ...updateUserDto,
        bio: updateUserDto.bio ?? user.bio,
      })
      .where(eq(usersTable.id, id))
      .returning();

    const { passwordHash: _, ...userWithoutPassword } = updated[0];
    return userWithoutPassword;
  }
}
