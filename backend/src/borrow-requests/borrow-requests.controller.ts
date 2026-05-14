import { Controller, Post, Get, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { BorrowRequestsService } from './borrow-requests.service';
import { JwtGuard } from '../auth/jwtGuard.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/users.entity';

@Controller('borrow-requests')
@UseGuards(JwtGuard)
export class BorrowRequestsController {
  constructor(private readonly borrowRequestsService: BorrowRequestsService) {}

  @Post()
  async createRequest(@Body() body: { bookId: number; notes?: string }, @Req() req) {
    return this.borrowRequestsService.createRequest(req.user.id, body.bookId, body.notes);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.borrowRequestsService.findAll();
  }

  @Get('my-requests')
  async findMyRequests(@Req() req) {
    return this.borrowRequestsService.findByUser(req.user.id);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN)
  async approveRequest(@Param('id') id: number) {
    return this.borrowRequestsService.approveRequest(id);
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN)
  async rejectRequest(@Param('id') id: number) {
    return this.borrowRequestsService.rejectRequest(id);
  }

  @Delete(':id')
  async cancelRequest(@Param('id') id: number, @Req() req) {
    return this.borrowRequestsService.cancelRequest(id, req.user.id);
  }
}
