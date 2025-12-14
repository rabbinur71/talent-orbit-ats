import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import type { Response } from 'express';
import type { Readable } from 'node:stream';

const APPS_BASE: string =
  process.env.APPLICATIONS_SERVICE_URL ?? 'http://localhost:3003';
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

type CreateApplicationBody = {
  jobId: string;
  name: string;
  email: string;
  phone: string;
  note?: string;
};

type UpdateStatusBody = {
  status:
    | 'APPLIED'
    | 'SCREENED'
    | 'INTERVIEWED'
    | 'OFFERED'
    | 'HIRED'
    | 'REJECTED';
};

type UploadedResume = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

function isUploadedResume(value: unknown): value is UploadedResume {
  if (!isRecord(value)) return false;
  return (
    value['buffer'] instanceof Buffer &&
    typeof value['originalname'] === 'string' &&
    typeof value['mimetype'] === 'string' &&
    typeof value['size'] === 'number'
  );
}

function isReadableStream(value: unknown): value is Readable {
  if (!isRecord(value)) return false;
  const pipe = value['pipe'];
  return typeof pipe === 'function';
}

@Controller('api/v1')
export class ApplicationsProxyController {
  constructor(private readonly http: HttpService) {}

  @Post('applications')
  @UseInterceptors(FileInterceptor('resume'))
  async createApplication(
    @UploadedFile() file: unknown,
    @Body() body: CreateApplicationBody,
  ): Promise<unknown> {
    if (!isUploadedResume(file)) {
      throw new HttpException({ message: 'Resume file is required' }, 400);
    }

    const form = new FormData();
    form.append('jobId', body.jobId);
    form.append('name', body.name);
    form.append('email', body.email);
    form.append('phone', body.phone);
    if (typeof body.note === 'string') {
      form.append('note', body.note);
    }

    form.append('resume', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size,
    });

    try {
      const res = await firstValueFrom(
        this.http.post(`${APPS_BASE}/applications`, form, {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }),
      );
      return res.data;
    } catch (err: unknown) {
      throw this.toHttpException(err, 'Applications service error');
    }
  }

  @Get('applications/status/:token')
  async status(@Param('token') token: string): Promise<unknown> {
    try {
      const res = await firstValueFrom(
        this.http.get(`${APPS_BASE}/applications/status/${token}`),
      );
      return res.data;
    } catch (err: unknown) {
      throw this.toHttpException(err, 'Applications service error');
    }
  }

  @Get('jobs/:jobId/applications')
  async listByJob(
    @Param('jobId') jobId: string,
    @Headers('authorization') authorization: string | undefined,
  ): Promise<unknown> {
    await this.requireRecruiter(authorization);

    try {
      const res = await firstValueFrom(
        this.http.get(`${APPS_BASE}/applications`, {
          params: { jobId },
        }),
      );
      return res.data;
    } catch (err: unknown) {
      throw this.toHttpException(err, 'Applications service error');
    }
  }

  @Patch('applications/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusBody,
    @Headers('authorization') authorization: string | undefined,
  ): Promise<unknown> {
    await this.requireRecruiter(authorization);

    try {
      const res = await firstValueFrom(
        this.http.patch(`${APPS_BASE}/applications/${id}/status`, body),
      );
      return res.data;
    } catch (err: unknown) {
      throw this.toHttpException(err, 'Applications service error');
    }
  }

  @Get('applications/:id/resume')
  async downloadResume(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    await this.requireRecruiter(authorization);

    try {
      const upstream = await firstValueFrom(
        this.http.get(`${APPS_BASE}/applications/${id}/resume`, {
          responseType: 'stream',
        }),
      );

      const headersUnknown: unknown = upstream.headers;

      if (isRecord(headersUnknown)) {
        const ct: unknown = headersUnknown['content-type'];
        if (typeof ct === 'string') {
          res.setHeader('Content-Type', ct);
        }

        const cd: unknown = headersUnknown['content-disposition'];
        if (typeof cd === 'string') {
          res.setHeader('Content-Disposition', cd);
        }
      }

      const stream = upstream.data as unknown;
      if (!isReadableStream(stream)) {
        res.status(502).json({ message: 'Invalid upstream stream' });
        return;
      }

      stream.pipe(res);
    } catch (err: unknown) {
      const ex = this.toHttpException(err, 'Applications service error');
      res.status(ex.getStatus()).json(ex.getResponse());
    }
  }

  private async requireRecruiter(
    authorization: string | undefined,
  ): Promise<AuthMeResponse> {
    if (!authorization) {
      throw new HttpException({ message: 'Missing Authorization header' }, 401);
    }

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
