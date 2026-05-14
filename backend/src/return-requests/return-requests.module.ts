import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnRequestsService } from './return-requests.service';
import { ReturnRequestsController } from './return-requests.controller';
import { ReturnRequest } from './return-request.entity';
import { BorrowedBooksModule } from '../borrowed-books/borrowed-books.module';
import { Book } from '../books/books.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnRequest, Book]), BorrowedBooksModule],
  controllers: [ReturnRequestsController],
  providers: [ReturnRequestsService],
})
export class ReturnRequestsModule {}
