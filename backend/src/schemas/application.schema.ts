import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApplicationStatus } from '../common/enums/application-status.enum';

export type ApplicationDocument = HydratedDocument<Application>;

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'Job', required: true, index: true })
  job: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  applicant: Types.ObjectId;

  @Prop({
    required: true,
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
    index: true,
  })
  status: ApplicationStatus;

  @Prop({ required: true })
  resumeKey: string;

  @Prop({ required: true })
  resumeUrl: string;

  @Prop({ trim: true })
  coverLetter?: string;

  @Prop({ type: [{ status: String, changedAt: Date, changedBy: Types.ObjectId }], default: [] })
  statusHistory: {
    status: ApplicationStatus;
    changedAt: Date;
    changedBy?: Types.ObjectId;
  }[];
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
