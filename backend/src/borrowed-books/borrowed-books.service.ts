import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BorrowedBook, BorrowStatus } from './borrowed-book.entity';
import { Book } from '../books/books.entity';

@Injectable()
export class BorrowedBooksService {
  constructor(
    @InjectRepository(BorrowedBook)
    private readonly borrowedBookRepository: Repository<BorrowedBook>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async createBorrow(userId: number, bookId: number): Promise<BorrowedBook> {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new Error('Book not found');
    }

    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowDate.getDate() + 14); // 2 weeks borrowing period

    const borrowedBook = this.borrowedBookRepository.create({
      userId,
      bookId,
      borrowDate,
      dueDate,
      status: BorrowStatus.ACTIVE,
    });

    return this.borrowedBookRepository.save(borrowedBook);
  }

  async findByUser(userId: number): Promise<BorrowedBook[]> {
    return this.borrowedBookRepository.find({
      where: { userId },
      relations: ['book'],
    });
  }

  async findById(id: number): Promise<BorrowedBook | null> {
    return this.borrowedBookRepository.findOne({
      where: { id },
      relations: ['book', 'user'],
    });
  }

  async hasActiveBorrow(userId: number, bookId: number): Promise<boolean> {
    const existing = await this.borrowedBookRepository.findOne({
      where: {
        userId,
        bookId,
        status: BorrowStatus.ACTIVE,
      },
    });
    return Boolean(existing);
  }

  async findAll(): Promise<BorrowedBook[]> {
    return this.borrowedBookRepository.find({
      relations: ['user', 'book'],
    });
  }

  async returnBook(borrowId: number, userId: number): Promise<BorrowedBook> {
    const borrowedBook = await this.borrowedBookRepository.findOne({
      where: { id: borrowId, userId },
      relations: ['book'],
    });

    if (!borrowedBook) {
      throw new Error('Borrow record not found');
    }

    if (borrowedBook.status !== BorrowStatus.ACTIVE) {
      throw new Error('Book is already returned');
    }

    // Update book availability
    const book = borrowedBook.book;
    book.availableCopies += 1;
    await this.bookRepository.save(book);

    // Update borrow record
    borrowedBook.returnDate = new Date();
    borrowedBook.status = BorrowStatus.RETURNED;
    return this.borrowedBookRepository.save(borrowedBook);
  }

  async checkOverdueBooks(): Promise<BorrowedBook[]> {
    const today = new Date();
    return this.borrowedBookRepository
      .createQueryBuilder('borrowedBook')
      .leftJoinAndSelect('borrowedBook.book', 'book')
      .leftJoinAndSelect('borrowedBook.user', 'user')
      .where('borrowedBook.dueDate < :today', { today })
      .andWhere('borrowedBook.status = :status', { status: BorrowStatus.ACTIVE })
      .getMany();
  }
}
