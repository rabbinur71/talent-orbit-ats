import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

export type JobStatus = 'open' | 'closed';

export type JobPublic = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  department: string | null;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type JobCreated = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  department: string | null;
  status: JobStatus;
  createdByUserId: string;
  createdAt: Date;
};

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  listOpen(): Promise<JobPublic[]> {
    return this.prisma.job.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        department: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getById(id: string): Promise<JobPublic> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        department: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  create(dto: CreateJobDto): Promise<JobCreated> {
    const status: JobStatus = dto.status ?? 'open';

    return this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        department: dto.department,
        status,
        createdByUserId: dto.createdByUserId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        department: true,
        status: true,
        createdByUserId: true,
        createdAt: true,
      },
    });
  }
}
