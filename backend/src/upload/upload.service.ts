import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('aws.s3Endpoint');
    this.s3 = new S3Client({
      region: this.configService.get<string>('aws.region'),
      ...(endpoint && { endpoint, forcePathStyle: true }),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId') || '',
        secretAccessKey:
          this.configService.get<string>('aws.secretAccessKey') || '',
      },
    });
    this.bucket = this.configService.get<string>('aws.s3Bucket') || '';
  }

  async uploadResume(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ key: string; url: string }> {
    const key = `resumes/${userId}/${randomUUID()}.pdf`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: 'application/pdf',
      }),
    );
    const url = await this.getSignedDownloadUrl(key);
    return { key, url };
  }

  async getSignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async getResumeStream(key: string): Promise<Readable> {
    const response = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    if (!response.Body) {
      throw new Error('Resume file not found');
    }
    return response.Body as Readable;
  }
}
