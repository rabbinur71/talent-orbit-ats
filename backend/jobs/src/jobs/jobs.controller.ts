import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsService, JobCreated, JobPublic } from './jobs.service';

@Controller()
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Get('health')
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }

  // Public: list only open jobs
  @Get('jobs')
  async listOpen(): Promise<JobPublic[]> {
    return this.jobs.listOpen();
  }

  // Public: job detail
  @Get('jobs/:id')
  async getById(@Param('id') id: string): Promise<JobPublic> {
    return this.jobs.getById(id);
  }

  // Create is recruiter-only, enforced at Gateway level (MVP).
  @Post('jobs')
  async create(@Body() dto: CreateJobDto): Promise<JobCreated> {
    return this.jobs.create(dto);
  }
}
