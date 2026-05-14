import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { BorrowedBooksService } from './borrowed-books.service';
import { JwtGuard } from '../auth/jwtGuard.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/users.entity';

@Controller('borrowed-books')
@UseGuards(JwtGuard)
export class BorrowedBooksController {
  constructor(private readonly borrowedBooksService: BorrowedBooksService) {}

  @Get('my-books')
  async findMyBooks(@Req() req) {
    return this.borrowedBooksService.findByUser(req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.borrowedBooksService.findAll();
  }

  @Post(':id/return')
  async returnBook(@Param('id') id: number, @Req() req) {
    return this.borrowedBooksService.returnBook(id, req.user.id);
  }

  @Get('overdue')
  @Roles(Role.ADMIN)
  async getOverdueBooks() {
    return this.borrowedBooksService.checkOverdueBooks();
  }
}
