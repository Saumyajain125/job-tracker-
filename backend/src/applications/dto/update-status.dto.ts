import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

export class UpdateStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
