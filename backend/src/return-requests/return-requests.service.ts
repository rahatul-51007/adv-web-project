import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnRequest, ReturnRequestStatus } from './return-request.entity';
import { BorrowedBooksService } from '../borrowed-books/borrowed-books.service';
import { BorrowStatus } from '../borrowed-books/borrowed-book.entity';

@Injectable()
export class ReturnRequestsService {
  constructor(
    @InjectRepository(ReturnRequest)
    private readonly returnRequestRepository: Repository<ReturnRequest>,
    private readonly borrowedBooksService: BorrowedBooksService,
  ) {}

  async createReturnRequest(userId: number, borrowId: number): Promise<ReturnRequest> {
    const borrowedBook = await this.borrowedBooksService.findById(borrowId);
    if (!borrowedBook || borrowedBook.userId !== userId) {
      throw new BadRequestException('Borrow record not found or does not belong to the current user');
    }

    if (borrowedBook.status !== BorrowStatus.ACTIVE) {
      throw new BadRequestException('Only active borrowed books can be returned');
    }

    const existing = await this.returnRequestRepository.findOne({
      where: { borrowId, status: ReturnRequestStatus.PENDING },
    });
    if (existing) {
      throw new BadRequestException('A return request for this borrowed book is already pending');
    }

    const returnRequest = this.returnRequestRepository.create({
      userId,
      bookId: borrowedBook.bookId,
      borrowId,
      status: ReturnRequestStatus.PENDING,
    });

    return this.returnRequestRepository.save(returnRequest);
  }

  async findAll(): Promise<ReturnRequest[]> {
    return this.returnRequestRepository.find({
      relations: ['user', 'book', 'borrowedBook'],
    });
  }

  async findByUser(userId: number): Promise<ReturnRequest[]> {
    return this.returnRequestRepository.find({
      where: { userId },
      relations: ['book', 'borrowedBook'],
    });
  }

  async approveRequest(id: number): Promise<ReturnRequest> {
    const request = await this.returnRequestRepository.findOne({
      where: { id },
      relations: ['borrowedBook', 'borrowedBook.book'],
    });

    if (!request) {
      throw new NotFoundException('Return request not found');
    }

    if (request.status !== ReturnRequestStatus.PENDING) {
      throw new BadRequestException('Return request already processed');
    }

    const borrow = request.borrowedBook;
    if (!borrow || borrow.status !== BorrowStatus.ACTIVE) {
      throw new BadRequestException('Borrow record is not active');
    }

    await this.borrowedBooksService.returnBook(borrow.id, borrow.userId);

    request.status = ReturnRequestStatus.APPROVED;
    return this.returnRequestRepository.save(request);
  }

  async rejectRequest(id: number): Promise<ReturnRequest> {
    const request = await this.returnRequestRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Return request not found');
    }

    if (request.status !== ReturnRequestStatus.PENDING) {
      throw new BadRequestException('Return request already processed');
    }

    request.status = ReturnRequestStatus.REJECTED;
    return this.returnRequestRepository.save(request);
  }
}
