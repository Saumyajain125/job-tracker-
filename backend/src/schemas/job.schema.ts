import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { JobStatus } from '../common/enums/job-status.enum';

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, trim: true, index: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [], index: true })
  skills: string[];

  @Prop({ required: true, trim: true, index: true })
  location: string;

  @Prop({ required: true, min: 0 })
  salaryMin: number;

  @Prop({ required: true, min: 0 })
  salaryMax: number;

  @Prop({ required: true, enum: JobStatus, default: JobStatus.OPEN, index: true })
  status: JobStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recruiter: Types.ObjectId;

  @Prop({ trim: true })
  company?: string;

  @Prop({ trim: true })
  employmentType?: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
JobSchema.index({ title: 'text', description: 'text', skills: 'text' });
