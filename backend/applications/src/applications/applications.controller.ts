import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApplicationsService } from './applications.service';

function safeFilename(original: string): string {
  const base = path.basename(original).replace(/[^\w.-]+/g, '_');
  return base.length > 120 ? base.slice(-120) : base;
}

function uploadDir(): string {
  return process.env.UPLOAD_DIR ?? '/app/uploads';
}

function allowMime(mime: string): boolean {
  return (
    mime === 'application/pdf' ||
    mime === 'application/msword' ||
    mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
}

@Controller()
export class ApplicationsController {
  constructor(private readonly apps: ApplicationsService) {}

  @Get('health')
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }

  // Candidate apply (multipart form-data)
  @Post('applications')
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir()),
        filename: (_req, file, cb) => {
          const prefix = randomBytes(8).toString('hex');
          cb(null, `${prefix}_${safeFilename(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!allowMime(file.mimetype)) {
          cb(new BadRequestException('Unsupported file type'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() dto: CreateApplicationDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('Resume file is required');

    const fullPath = path.join(uploadDir(), file.filename);

    return this.apps.create(dto, {
      resumePath: fullPath,
      resumeFilename: file.originalname,
      resumeSizeBytes: file.size,
      resumeMimeType: file.mimetype,
    });
  }

  // Recruiter: list applications by jobId (gateway enforces auth)
  @Get('applications')
  async listByJob(@Query('jobId') jobId: string | undefined) {
    if (!jobId) throw new BadRequestException('jobId is required');
    return this.apps.listByJob(jobId);
  }

  // Recruiter: update status (gateway enforces auth)
  @Patch('applications/:id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.apps.updateStatus(id, dto);
  }

  // Public: status lookup
  @Get('applications/status/:token')
  async status(@Param('token') token: string) {
    return this.apps.statusByToken(token);
  }

  // Recruiter: download resume (gateway enforces auth)
  @Get('applications/:id/resume')
  async downloadResume(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const meta = await this.apps.getResumeInfo(id);

    const root = uploadDir();
    const resolved = path.resolve(meta.resumePath);
    const allowedRoot = path.resolve(root);

    if (
      !resolved.startsWith(allowedRoot + path.sep) &&
      resolved !== allowedRoot
    ) {
      throw new BadRequestException('Invalid resume path');
    }

    res.setHeader('Content-Type', meta.resumeMimeType);
    res.download(meta.resumePath, safeFilename(meta.resumeFilename));
  }
}
