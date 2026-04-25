import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'senai-secret-key';

export class UserService {
  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    });
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Usuário não encontrado');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Senha inválida');

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { user: { id: user.id, nome: user.nome, email: user.email, role: user.role }, token };
  }

  async getAllUsers() {
    return await prisma.user.findMany({
      select: { id: true, nome: true, email: true, role: true, createdAt: true }
    });
  }

  async updateUser(id: number, data: any) {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, nome: true, email: true, role: true }
    });
  }

  async deleteUser(id: number) {
    return await prisma.user.delete({
      where: { id }
    });
  }
}

