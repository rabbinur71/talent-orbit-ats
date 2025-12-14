import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  department?: string;

  // Gateway injects this after validating JWT via Auth /auth/me
  @IsString()
  createdByUserId!: string;

  // Optional override; default open
  @IsOptional()
  @IsIn(['open', 'closed'])
  status?: 'open' | 'closed';
}
