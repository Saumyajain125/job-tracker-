import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { UserDocument } from '../schemas/user.schema';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post('jobs/:jobId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  @UseInterceptors(FileInterceptor('resume'))
  apply(
    @Param('jobId') jobId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateApplicationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.applicationsService.apply(
      jobId,
      user._id.toString(),
      file,
      dto,
    );
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.JOB_SEEKER)
  findMine(@CurrentUser() user: UserDocument) {
    return this.applicationsService.findByApplicant(user._id.toString());
  }

  @Get('jobs/:jobId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER)
  findByJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.applicationsService.findByJob(jobId, user._id.toString());
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.applicationsService.updateStatus(
      id,
      dto,
      user._id.toString(),
    );
  }

  @Get(':id/resume')
  async getResume(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ) {
    const { stream, filename } = await this.applicationsService.getResumeFile(
      id,
      user._id.toString(),
      user.role,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    stream.pipe(res);
  }
}
