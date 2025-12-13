import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Post,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const AUTH_BASE: string =
  process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';

type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
};

type RegisterResponse = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  recruiter: {
    id: string;
    email: string;
    name: string | null;
  };
};

type MeResponse = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

type ErrorBody = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeErrorBody(data: unknown, fallbackMessage: string): ErrorBody {
  if (isRecord(data)) return data;
  if (typeof data === 'string') return { message: data };
  return { message: fallbackMessage };
}

function extractAxiosLikeResponse(
  err: unknown,
): { status: number; data: unknown } | null {
  if (!isRecord(err)) return null;

  // axios errors expose isAxiosError: true
  if (err['isAxiosError'] !== true) return null;

  const response = err['response'];
  if (!isRecord(response)) {
    return { status: 502, data: { message: 'Auth service error' } };
  }

  const statusRaw = response['status'];
  const data = response['data'];

  const status = typeof statusRaw === 'number' ? statusRaw : 502;
  return { status, data };
}

@Controller('api/v1')
export class AuthProxyController {
  constructor(private readonly http: HttpService) {}

  @Post('auth/register')
  async register(@Body() body: RegisterRequest): Promise<RegisterResponse> {
    try {
      const res = await firstValueFrom(
        this.http.post<RegisterResponse>(`${AUTH_BASE}/auth/register`, body),
      );
      return res.data;
    } catch (err: unknown) {
      throw this.toHttpException(err);
    }
  }

  @Post('auth/login')
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>(`${AUTH_BASE}/auth/login`, body),
      );
      return res.data;
    } catch (err: unknown) {
      throw this.toHttpException(err);
    }
  }

  @Get('auth/me')
  async me(
    @Headers('authorization') authorization?: string,
  ): Promise<MeResponse> {
    try {
      const res = await firstValueFrom(
        this.http.get<MeResponse>(`${AUTH_BASE}/auth/me`, {
          headers: authorization ? { authorization } : undefined,
        }),
      );
      return res.data;
    } catch (err: unknown) {
      throw this.toHttpException(err);
    }
  }

  private toHttpException(err: unknown): HttpException {
    const axiosLike = extractAxiosLikeResponse(err);
    if (axiosLike) {
      const body = normalizeErrorBody(axiosLike.data, 'Auth service error');
      return new HttpException(body, axiosLike.status);
    }

    return new HttpException({ message: 'Gateway proxy error' }, 502);
  }
}
