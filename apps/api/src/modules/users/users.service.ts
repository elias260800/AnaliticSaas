import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

interface InMemoryUser {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  userRoles: { role: { name: string } }[];
  lastLoginAt: string | null;
  createdAt: string;
}

@Injectable()
export class UsersService {
  // In-memory mock database for offline demo mode
  private mockUsers: InMemoryUser[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      tenantId: '770e8400-e29b-41d4-a716-446655440001',
      email: 'admin@empresa.com',
      passwordHash: '', // Hashes handled dynamically
      firstName: 'Carlos',
      lastName: 'García',
      isActive: true,
      userRoles: [{ role: { name: 'admin' } }],
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      tenantId: '770e8400-e29b-41d4-a716-446655440001',
      email: 'maria@empresa.com',
      passwordHash: '',
      firstName: 'María',
      lastName: 'López',
      isActive: true,
      userRoles: [{ role: { name: 'manager' } }],
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      tenantId: '770e8400-e29b-41d4-a716-446655440001',
      email: 'jorge@empresa.com',
      passwordHash: '',
      firstName: 'Jorge',
      lastName: 'Pérez',
      isActive: true,
      userRoles: [{ role: { name: 'analyst' } }],
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  ];

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string): Promise<any[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: { tenantId },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
      return users;
    } catch {
      return this.mockUsers.filter((u) => u.tenantId === tenantId);
    }
  }

  async findOne(id: string, tenantId: string): Promise<any> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, tenantId },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
      if (!user) throw new NotFoundException('Usuario no encontrado');
      return user;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      const user = this.mockUsers.find((u) => u.id === id && u.tenantId === tenantId);
      if (!user) throw new NotFoundException('Usuario no encontrado');
      return user;
    }
  }

  async create(tenantId: string, dto: CreateUserDto): Promise<any> {
    // 1. Verify uniqueness
    try {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, tenantId },
      });
      if (existing) {
        throw new ConflictException(`El correo electrónico ${dto.email} ya está registrado`);
      }
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      // In-memory duplicate check
      const existing = this.mockUsers.find((u) => u.email === dto.email && u.tenantId === tenantId);
      if (existing) {
        throw new ConflictException(`El correo electrónico ${dto.email} ya está registrado`);
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            tenantId,
            email: dto.email,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            isActive: true,
          },
        });

        // Map roles
        for (const roleName of dto.roles) {
          // Find or create role
          let role = await tx.role.findFirst({
            where: { name: roleName, tenantId },
          });

          if (!role) {
            role = await tx.role.create({
              data: {
                tenantId,
                name: roleName,
                description: `Rol de ${roleName}`,
              },
            });
          }

          await tx.userRole.create({
            data: {
              userId: user.id,
              roleId: role.id,
            },
          });
        }

        return tx.user.findUnique({
          where: { id: user.id },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });
      });
    } catch (err) {
      console.warn('⚠️ Prisma create user failed. Registering in offline memory.', err.message);

      // In-memory insertion
      const newUser: InMemoryUser = {
        id: `user-uuid-${Date.now()}`,
        tenantId,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isActive: true,
        userRoles: dto.roles.map((r) => ({ role: { name: r } })),
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
      };

      this.mockUsers.push(newUser);
      return newUser;
    }
  }

  async update(id: string, tenantId: string, dto: UpdateUserDto): Promise<any> {
    if (dto.email) {
      try {
        const existing = await this.prisma.user.findFirst({
          where: { email: dto.email, tenantId, NOT: { id } },
        });
        if (existing) {
          throw new ConflictException(`El correo electrónico ${dto.email} ya está registrado`);
        }
      } catch (err) {
        if (err instanceof ConflictException) throw err;
        const existing = this.mockUsers.find((u) => u.email === dto.email && u.tenantId === tenantId && u.id !== id);
        if (existing) {
          throw new ConflictException(`El correo electrónico ${dto.email} ya está registrado`);
        }
      }
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findFirst({
          where: { id, tenantId },
        });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        await tx.user.update({
          where: { id },
          data: {
            email: dto.email,
            passwordHash: passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            isActive: dto.isActive,
          },
        });

        if (dto.roles) {
          // Re-map roles: delete existing and recreate
          await tx.userRole.deleteMany({ where: { userId: id } });

          for (const roleName of dto.roles) {
            let role = await tx.role.findFirst({
              where: { name: roleName, tenantId },
            });

            if (!role) {
              role = await tx.role.create({
                data: {
                  tenantId,
                  name: roleName,
                  description: `Rol de ${roleName}`,
                },
              });
            }

            await tx.userRole.create({
              data: {
                userId: id,
                roleId: role.id,
              },
            });
          }
        }

        return tx.user.findUnique({
          where: { id },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      console.warn('⚠️ Prisma update user failed. Modifying offline memory.', err.message);

      const index = this.mockUsers.findIndex((u) => u.id === id && u.tenantId === tenantId);
      if (index === -1) throw new NotFoundException('Usuario no encontrado');

      this.mockUsers[index] = {
        ...this.mockUsers[index],
        email: dto.email ?? this.mockUsers[index].email,
        passwordHash: passwordHash ?? this.mockUsers[index].passwordHash,
        firstName: dto.firstName ?? this.mockUsers[index].firstName,
        lastName: dto.lastName ?? this.mockUsers[index].lastName,
        isActive: dto.isActive ?? this.mockUsers[index].isActive,
        userRoles: dto.roles ? dto.roles.map((r) => ({ role: { name: r } })) : this.mockUsers[index].userRoles,
      };

      return this.mockUsers[index];
    }
  }

  async remove(id: string, tenantId: string): Promise<{ success: boolean }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, tenantId },
      });
      if (!user) throw new NotFoundException('Usuario no encontrado');

      await this.prisma.user.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      const index = this.mockUsers.findIndex((u) => u.id === id && u.tenantId === tenantId);
      if (index === -1) throw new NotFoundException('Usuario no encontrado');

      this.mockUsers.splice(index, 1);
      return { success: true };
    }
  }
}
