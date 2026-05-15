import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Req,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ReturnRequestsService } from './return-requests.service';
import { JwtGuard } from '../auth/jwtGuard.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/users.entity';

@Controller('return-requests')
@UseGuards(JwtGuard)
export class ReturnRequestsController {
  constructor(private readonly returnRequestsService: ReturnRequestsService) {}

  @Post()
  async createReturnRequest(@Req() req, @Body() body: { borrowId: number }) {
    return this.returnRequestsService.createReturnRequest(
      req.user.id,
      body.borrowId,
    );
  }

  @Post('return-request')
  async createReturnRequestAlias(
    @Req() req,
    @Body() body: { borrowId: number },
  ) {
    return this.createReturnRequest(req, body);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.returnRequestsService.findAll();
  }

  @Get('my-requests')
  async findByUser(@Req() req) {
    return this.returnRequestsService.findByUser(req.user.id);
  }

  @Get('return-request/my-requests')
  async findByUserAlias(@Req() req) {
    return this.findByUser(req);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN)
  async approveRequest(@Param('id', ParseIntPipe) id: number) {
    return this.returnRequestsService.approveRequest(id);
  }

  @Post('return-request/:id/approve')
  @Roles(Role.ADMIN)
  async approveRequestAlias(@Param('id', ParseIntPipe) id: number) {
    return this.returnRequestsService.approveRequest(id);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN)
  async rejectRequest(@Param('id', ParseIntPipe) id: number) {
    return this.returnRequestsService.rejectRequest(id);
  }

  @Post('return-request/:id/reject')
  @Roles(Role.ADMIN)
  async rejectRequestAlias(@Param('id', ParseIntPipe) id: number) {
    return this.returnRequestsService.rejectRequest(id);
  }
}
