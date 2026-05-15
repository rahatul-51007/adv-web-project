import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BorrowRequest, BorrowRequestStatus } from './borrow-request.entity';
import { Book, BookStatus } from '../books/books.entity';
import { User } from '../users/users.entity';
import { BorrowedBooksService } from '../borrowed-books/borrowed-books.service';

@Injectable()
export class BorrowRequestsService {
  constructor(
    @InjectRepository(BorrowRequest)
    private readonly borrowRequestRepository: Repository<BorrowRequest>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly borrowedBooksService: BorrowedBooksService,
  ) {}

  async createRequest(
    userId: number,
    bookId: number,
    notes?: string,
  ): Promise<BorrowRequest> {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new Error('Book not found');
    }
    if (book.availableCopies <= 0) {
      throw new Error('Book is not available for borrowing');
    }

    const hasActiveBorrow = await this.borrowedBooksService.hasActiveBorrow(
      userId,
      bookId,
    );
    if (hasActiveBorrow) {
      throw new Error(
        'You already have this book borrowed and cannot request it again',
      );
    }

    const existingRequest = await this.borrowRequestRepository.findOne({
      where: { userId, bookId, status: BorrowRequestStatus.PENDING },
    });
    if (existingRequest) {
      throw new Error('You already have a pending request for this book');
    }

    const borrowRequest = this.borrowRequestRepository.create({
      userId,
      bookId,
      notes,
      status: BorrowRequestStatus.PENDING,
    });

    return this.borrowRequestRepository.save(borrowRequest);
  }

  async findAll(): Promise<BorrowRequest[]> {
    return this.borrowRequestRepository.find({
      relations: ['user', 'book'],
    });
  }

  async findByUser(userId: number): Promise<BorrowRequest[]> {
    return this.borrowRequestRepository.find({
      where: { userId },
      relations: ['user', 'book'],
    });
  }

  async approveRequest(requestId: number): Promise<BorrowRequest> {
    const request = await this.borrowRequestRepository.findOne({
      where: { id: requestId },
      relations: ['book'],
    });

    if (!request) {
      throw new Error('Borrow request not found');
    }

    if (request.status !== BorrowRequestStatus.PENDING) {
      throw new Error('Request has already been processed');
    }

    const book = request.book;
    if (book.availableCopies <= 0) {
      throw new Error('Book is no longer available');
    }

    book.availableCopies -= 1;

    if (book.availableCopies === 0) {
      book.status = BookStatus.BORROWED;
    }

    await this.bookRepository.save(book);

    await this.borrowedBooksService.createBorrow(request.userId, book.id);

    request.status = BorrowRequestStatus.APPROVED;
    return this.borrowRequestRepository.save(request);
  }

  async rejectRequest(requestId: number): Promise<BorrowRequest> {
    const request = await this.borrowRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Borrow request not found');
    }

    if (request.status !== BorrowRequestStatus.PENDING) {
      throw new Error('Request has already been processed');
    }

    request.status = BorrowRequestStatus.REJECTED;
    return this.borrowRequestRepository.save(request);
  }

  async cancelRequest(
    requestId: number,
    userId: number,
  ): Promise<BorrowRequest> {
    const request = await this.borrowRequestRepository.findOne({
      where: { id: requestId, userId },
    });

    if (!request) {
      throw new Error('Borrow request not found');
    }

    if (request.status !== BorrowRequestStatus.PENDING) {
      throw new Error('Cannot cancel a processed request');
    }

    return this.borrowRequestRepository.remove(request);
  }
}
