import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService, LoginResult, RecruiterPublic } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type JwtUser = {
  userId: string;
  email: string;
};

type AuthedRequest = Request & {
  user: JwtUser;
};

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('health')
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Post('auth/register')
  async register(@Body() dto: RegisterDto): Promise<RecruiterPublic> {
    return this.auth.register(dto.email, dto.password, dto.name);
  }

  @Post('auth/login')
  async login(@Body() dto: LoginDto): Promise<LoginResult> {
    return this.auth.login(dto.email, dto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('auth/me')
  async me(@Req() req: AuthedRequest): Promise<RecruiterPublic | null> {
    return this.auth.getMe(req.user.userId);
  }
}
