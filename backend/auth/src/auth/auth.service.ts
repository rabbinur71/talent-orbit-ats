import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

export type RecruiterPublic = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

export type LoginResult = {
  access_token: string;
  recruiter: {
    id: string;
    email: string;
    name: string | null;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<RecruiterPublic> {
    const existing = await this.prisma.recruiter.findUnique({
      where: { email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 12);

    return this.prisma.recruiter.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { email },
    });
    if (!recruiter) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, recruiter.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const access_token = await this.jwt.signAsync(
      { email: recruiter.email },
      { subject: recruiter.id },
    );

    return {
      access_token,
      recruiter: {
        id: recruiter.id,
        email: recruiter.email,
        name: recruiter.name,
      },
    };
  }

  async getMe(userId: string): Promise<RecruiterPublic | null> {
    return await this.prisma.recruiter.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }
}
