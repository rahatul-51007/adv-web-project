import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowedBooksService } from './borrowed-books.service';
import { BorrowedBooksController } from './borrowed-books.controller';
import { BorrowedBook } from './borrowed-book.entity';
import { Book } from '../books/books.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BorrowedBook, Book])],
  controllers: [BorrowedBooksController],
  providers: [BorrowedBooksService],
  exports: [BorrowedBooksService],
})
export class BorrowedBooksModule {}
