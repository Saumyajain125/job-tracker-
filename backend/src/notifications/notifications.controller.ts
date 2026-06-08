import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../schemas/user.schema';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findMine(@CurrentUser() user: UserDocument) {
    return this.notificationsService.findByUser(user._id.toString());
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.notificationsService.markAsRead(id, user._id.toString());
  }
}
