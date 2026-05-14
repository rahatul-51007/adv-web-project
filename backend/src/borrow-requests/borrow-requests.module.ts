import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowRequestsService } from './borrow-requests.service';
import { BorrowRequestsController } from './borrow-requests.controller';
import { BorrowRequest } from './borrow-request.entity';
import { Book } from '../books/books.entity';
// import { BorrowedBooksModule } from '../borrowed-books/borrowed-books.module';

@Module({
  imports: [TypeOrmModule.forFeature([BorrowRequest, Book])], 
  // BorrowedBooksModule],
  controllers: [BorrowRequestsController],
  providers: [BorrowRequestsService],
  exports: [BorrowRequestsService],
})
export class BorrowRequestsModule {}
