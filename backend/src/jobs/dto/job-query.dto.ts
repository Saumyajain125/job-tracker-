import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { JobStatus } from '../../common/enums/job-status.enum';

export class JobQueryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumberString()
  salaryMin?: string;

  @IsOptional()
  @IsNumberString()
  salaryMax?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
