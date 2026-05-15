import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './books.entity';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { BorrowRequestsModule } from '../borrow-requests/borrow-requests.module';
import { BorrowRequest } from '../borrow-requests/borrow-request.entity';
import { BorrowedBook } from '../borrowed-books/borrowed-book.entity';
import { ReturnRequest } from '../return-requests/return-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      BorrowRequest,
      BorrowedBook,
      ReturnRequest,
    ]),
    BorrowRequestsModule,
  ],
  providers: [BooksService],
  controllers: [BooksController],
})
export class BooksModule {}
