import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  applicationId?: string;
  type?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(input: CreateNotificationInput) {
    return this.notificationModel.create({
      user: new Types.ObjectId(input.userId),
      title: input.title,
      message: input.message,
      application: input.applicationId
        ? new Types.ObjectId(input.applicationId)
        : undefined,
      type: input.type,
    });
  }

  async findByUser(userId: string) {
    return this.notificationModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markAsRead(id: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), user: new Types.ObjectId(userId) },
      { read: true },
      { new: true },
    );
  }
}
