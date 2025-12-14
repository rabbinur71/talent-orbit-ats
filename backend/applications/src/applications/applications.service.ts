import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

export type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENED'
  | 'INTERVIEWED'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED';

export type ApplicationPublic = {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  note: string | null;
  status: ApplicationStatus;
  publicToken: string;
  createdAt: Date;
};

export type StatusLookup = {
  publicToken: string;
  status: ApplicationStatus;
  jobId: string;
  createdAt: Date;
};

export type ApplicationListItem = {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  note: string | null;
  status: ApplicationStatus;
  createdAt: Date;
};

export type ResumeMeta = {
  resumePath: string;
  resumeFilename: string;
  resumeSizeBytes: number;
  resumeMimeType: string;
};

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    dto: CreateApplicationDto,
    resume: ResumeMeta,
  ): Promise<ApplicationPublic> {
    const publicToken = randomBytes(16).toString('hex');

    return this.prisma.application.create({
      data: {
        jobId: dto.jobId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        note: dto.note,
        status: 'APPLIED',
        publicToken,
        resumePath: resume.resumePath,
        resumeFilename: resume.resumeFilename,
        resumeSizeBytes: resume.resumeSizeBytes,
        resumeMimeType: resume.resumeMimeType,
      },
      select: {
        id: true,
        jobId: true,
        name: true,
        email: true,
        phone: true,
        note: true,
        status: true,
        publicToken: true,
        createdAt: true,
      },
    });
  }

  listByJob(jobId: string): Promise<ApplicationListItem[]> {
    return this.prisma.application.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        jobId: true,
        name: true,
        email: true,
        phone: true,
        note: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
  ): Promise<ApplicationListItem> {
    const exists = await this.prisma.application.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Application not found');

    return this.prisma.application.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        jobId: true,
        name: true,
        email: true,
        phone: true,
        note: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async statusByToken(publicToken: string): Promise<StatusLookup> {
    const app = await this.prisma.application.findUnique({
      where: { publicToken },
      select: { publicToken: true, status: true, jobId: true, createdAt: true },
    });
    if (!app) throw new NotFoundException('Invalid token');

    return {
      publicToken: app.publicToken,
      status: app.status,
      jobId: app.jobId,
      createdAt: app.createdAt,
    };
  }

  async getResumeInfo(id: string): Promise<ResumeMeta> {
    const app = await this.prisma.application.findUnique({
      where: { id },
      select: {
        resumePath: true,
        resumeFilename: true,
        resumeSizeBytes: true,
        resumeMimeType: true,
      },
    });
    if (!app) throw new NotFoundException('Application not found');
    return {
      resumePath: app.resumePath,
      resumeFilename: app.resumeFilename,
      resumeSizeBytes: app.resumeSizeBytes,
      resumeMimeType: app.resumeMimeType,
    };
  }
}
