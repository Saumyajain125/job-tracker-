import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsString()
  location: string;

  @IsNumber()
  @Min(0)
  salaryMin: number;

  @IsNumber()
  @Min(0)
  salaryMax: number;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  employmentType?: string;
}
