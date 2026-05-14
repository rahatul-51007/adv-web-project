import { Controller, Get, Param, Post, Query, UseGuards, Body , Put, Delete} from '@nestjs/common';
import { BooksService } from './books.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { JwtGuard } from '../auth/jwtGuard.guard';
import { Role } from '../users/users.entity';

@Controller('books')
@UseGuards(JwtGuard, RolesGuard)
export class BooksController {
    constructor(
        private readonly booksService: BooksService,
    ) {}

    @Post()
    @Roles(Role.ADMIN)
    async create(@Body() bookData:any) {
     return this.booksService.create(bookData);
    }

    @Get()
    @Roles(Role.ADMIN, Role.MEMBER)
    async findAll() {
     return this.booksService.findAll();
   }

   @Get('search')
   @Roles(Role.ADMIN, Role.MEMBER)
   async search(@Query('q') query: string) {
    return this.booksService.searchBooks(query);
  }
  @Get(':id')
  @Roles(Role.ADMIN, Role.MEMBER)
  async findOne(@Param('id') id: number) {
    return await this.booksService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: number, @Body() bookData: any) {
    return await this.booksService.update(id, bookData);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: number) {
    return await this.booksService.remove(id);
  }
}
