import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/drizzle.module.js';
import { usersTable } from '../db/schema.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

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

    const newUser = await this.db
      .insert(usersTable)
      .values({
        username,
        passwordHash: hashedPassword,
        fullName,
        bio: bio ?? null,
        createdAt: new Date(),
      })
      .returning();

    const { passwordHash: _, ...userWithoutPassword } = newUser[0];
    return userWithoutPassword;
  }
}
