import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from '../schemas/job.schema';
import { Application, ApplicationDocument } from '../schemas/application.schema';
import { JobStatus } from '../common/enums/job-status.enum';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    private redisService: RedisService,
  ) {}

  async create(dto: CreateJobDto, recruiterId: string) {
    const job = await this.jobModel.create({
      ...dto,
      recruiter: new Types.ObjectId(recruiterId),
    });
    await this.invalidateJobCache();
    return job;
  }

  async findAll(query: JobQueryDto) {
    const cacheKey = `jobs:list:${JSON.stringify(query)}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const filter: Record<string, unknown> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.title) {
      filter.title = { $regex: query.title, $options: 'i' };
    }
    if (query.location) {
      filter.location = { $regex: query.location, $options: 'i' };
    }
    if (query.skills) {
      const skills = query.skills.split(',').map((s) => s.trim());
      filter.skills = { $in: skills };
    }
    if (query.salaryMin) {
      filter.salaryMax = { $gte: parseInt(query.salaryMin, 10) };
    }
    if (query.salaryMax) {
      filter.salaryMin = { $lte: parseInt(query.salaryMax, 10) };
    }

    const [jobs, total] = await Promise.all([
      this.jobModel
        .find(filter)
        .populate('recruiter', 'name company email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.jobModel.countDocuments(filter),
    ]);

    const result = {
      data: jobs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    await this.redisService.set(cacheKey, result);
    return result;
  }

  async findOne(id: string) {
    const job = await this.jobModel
      .findById(id)
      .populate('recruiter', 'name company email');
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async findByRecruiter(recruiterId: string) {
    return this.jobModel
      .find({ recruiter: new Types.ObjectId(recruiterId) })
      .sort({ createdAt: -1 });
  }

  async update(id: string, dto: UpdateJobDto, recruiterId: string) {
    const job = await this.jobModel.findById(id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.recruiter.toString() !== recruiterId) {
      throw new ForbiddenException('You can only edit your own jobs');
    }

    Object.assign(job, dto);
    await job.save();
    await this.invalidateJobCache();
    return job;
  }

  async close(id: string, recruiterId: string) {
    return this.update(id, { status: JobStatus.CLOSED }, recruiterId);
  }

  async getRecruiterStats(recruiterId: string) {
    const jobs = await this.jobModel.find({
      recruiter: new Types.ObjectId(recruiterId),
    });
    const jobIds = jobs.map((j) => j._id);
    const openRoles = jobs.filter((j) => j.status === JobStatus.OPEN).length;
    const totalApplicants = await this.applicationModel.countDocuments({
      job: { $in: jobIds },
    });
    const hired = await this.applicationModel.countDocuments({
      job: { $in: jobIds },
      status: 'hired',
    });
    const conversionRate =
      totalApplicants > 0
        ? Math.round((hired / totalApplicants) * 10000) / 100
        : 0;

    return { openRoles, totalApplicants, conversionRate, totalJobs: jobs.length };
  }

  private async invalidateJobCache() {
    await this.redisService.del('jobs:list:*');
  }
}
