import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Application,
  ApplicationDocument,
} from '../schemas/application.schema';
import { Job, JobDocument } from '../schemas/job.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { JobStatus } from '../common/enums/job-status.enum';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UploadService } from '../upload/upload.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { EventsGateway } from '../gateway/events.gateway';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private uploadService: UploadService,
    private notificationsService: NotificationsService,
    private mailService: MailService,
    private eventsGateway: EventsGateway,
  ) {}

  async apply(
    jobId: string,
    applicantId: string,
    file: Express.Multer.File,
    dto: CreateApplicationDto,
  ) {
    if (!file || file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Resume must be a PDF file');
    }

    const job = await this.jobModel.findById(jobId);
    if (!job || job.status !== JobStatus.OPEN) {
      throw new NotFoundException('Job not found or closed');
    }

    const existing = await this.applicationModel.findOne({
      job: new Types.ObjectId(jobId),
      applicant: new Types.ObjectId(applicantId),
    });
    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    const { key, url } = await this.uploadService.uploadResume(file, applicantId);

    const application = await this.applicationModel.create({
      job: new Types.ObjectId(jobId),
      applicant: new Types.ObjectId(applicantId),
      resumeKey: key,
      resumeUrl: url,
      coverLetter: dto.coverLetter,
      statusHistory: [
        { status: ApplicationStatus.APPLIED, changedAt: new Date() },
      ],
    });

    return application.populate([
      { path: 'job', select: 'title company location' },
      { path: 'applicant', select: 'name email' },
    ]);
  }

  async findByApplicant(applicantId: string) {
    return this.applicationModel
      .find({ applicant: new Types.ObjectId(applicantId) })
      .populate('job', 'title company location status salaryMin salaryMax')
      .sort({ createdAt: -1 });
  }

  async findByJob(jobId: string, recruiterId: string) {
    const job = await this.jobModel.findById(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.recruiter.toString() !== recruiterId) {
      throw new ForbiddenException('Access denied');
    }

    return this.applicationModel
      .find({ job: new Types.ObjectId(jobId) })
      .populate('applicant', 'name email headline')
      .sort({ createdAt: -1 });
  }

  async updateStatus(
    applicationId: string,
    dto: UpdateStatusDto,
    recruiterId: string,
  ) {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate('job')
      .populate('applicant');

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = application.job as unknown as JobDocument;
    if (job.recruiter.toString() !== recruiterId) {
      throw new ForbiddenException('Access denied');
    }

    application.status = dto.status;
    application.statusHistory.push({
      status: dto.status,
      changedAt: new Date(),
      changedBy: new Types.ObjectId(recruiterId),
    });
    await application.save();

    const applicant = application.applicant as unknown as UserDocument;
    const notification = await this.notificationsService.create({
      userId: applicant._id.toString(),
      title: 'Application status updated',
      message: `Your application for ${job.title} is now ${dto.status.replace(/_/g, ' ')}`,
      applicationId: application._id.toString(),
      type: 'status_change',
    });

    this.eventsGateway.emitStatusChange(applicant._id.toString(), {
      applicationId: application._id,
      status: dto.status,
      jobTitle: job.title,
      notification,
    });

    await this.mailService.sendStatusChangeEmail(
      applicant.email,
      applicant.name,
      job.title,
      dto.status,
    );

    return application;
  }

  async getResumeFile(applicationId: string, userId: string, role: string) {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate('job');

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = application.job as unknown as JobDocument;
    const isApplicant = application.applicant.toString() === userId;
    const isRecruiter =
      role === 'recruiter' && job.recruiter.toString() === userId;

    if (!isApplicant && !isRecruiter) {
      throw new ForbiddenException('Access denied');
    }

    const stream = await this.uploadService.getResumeStream(
      application.resumeKey,
    );
    const filename =
      application.resumeKey.split('/').pop() || 'resume.pdf';

    return { stream, filename };
  }
}
