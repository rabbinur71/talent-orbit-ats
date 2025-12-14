import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const JOBS_BASE: string =
  process.env.JOBS_SERVICE_URL ?? 'http://localhost:3002';
const AUTH_BASE: string =
  process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';

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
  if (err['isAxiosError'] !== true) return null;

  const response = err['response'];
  if (!isRecord(response)) {
    return { status: 502, data: { message: 'Upstream error' } };
  }

  const statusRaw = response['status'];
  const data = response['data'];

  return { status: typeof statusRaw === 'number' ? statusRaw : 502, data };
}

type AuthMeResponse = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

type CreateJobBody = {
  title: string;
  description: string;
  location?: string;
  department?: string;
};

@Controller('api/v1')
export class JobsProxyController {
  constructor(private readonly http: HttpService) {}

  @Get('jobs')
  async listOpen(): Promise<unknown> {
    try {
      const res = await firstValueFrom(this.http.get(`${JOBS_BASE}/jobs`));
      return res.data;
    } catch (err: unknown) {
      throw this.toHttpException(err, 'Jobs service error');
    }
  }

  @Get('jobs/:id')
  async getById(@Param('id') id: string): Promise<unknown> {
    try {
      const res = await firstValueFrom(
        this.http.get(`${JOBS_BASE}/jobs/${id}`),
      );
      return res.data;
    } catch (err: unknown) {
      throw this.toHttpException(err, 'Jobs service error');
    }
  }

  @Post('jobs')
  async createJob(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateJobBody,
  ): Promise<unknown> {
    if (!authorization) {
      throw new HttpException({ message: 'Missing Authorization header' }, 401);
    }

    const me = await this.fetchMe(authorization);

    const payload: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      location: body.location,
      department: body.department,
      createdByUserId: me.id,
    };

    try {
      const res = await firstValueFrom(
        this.http.post(`${JOBS_BASE}/jobs`, payload),
      );
      return res.data;
    } catch (err: unknown) {
      throw this.toHttpException(err, 'Jobs service error');
    }
  }

  private async fetchMe(authorization: string): Promise<AuthMeResponse> {
    try {
      const res = await firstValueFrom(
        this.http.get<AuthMeResponse>(`${AUTH_BASE}/auth/me`, {
          headers: { authorization },
        }),
      );
      return res.data;
    } catch (err: unknown) {
      throw this.toHttpException(err, 'Auth service error');
    }
  }

  private toHttpException(err: unknown, fallback: string): HttpException {
    const axiosLike = extractAxiosLikeResponse(err);
    if (axiosLike) {
      const body = normalizeErrorBody(axiosLike.data, fallback);
      return new HttpException(body, axiosLike.status);
    }
    return new HttpException({ message: fallback }, 502);
  }
}
