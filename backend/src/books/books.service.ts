import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book, BookStatus } from './books.entity';
import { User } from '../users/users.entity';
import { BorrowRequest } from '../borrow-requests/borrow-request.entity';
import { BorrowedBook } from '../borrowed-books/borrowed-book.entity';
import { ReturnRequest } from '../return-requests/return-request.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BorrowRequest)
    private readonly borrowRequestRepository: Repository<BorrowRequest>,
    @InjectRepository(BorrowedBook)
    private readonly borrowedBookRepository: Repository<BorrowedBook>,
    @InjectRepository(ReturnRequest)
    private readonly returnRequestRepository: Repository<ReturnRequest>,
  ) {}

  async create(bookData: Partial<Book>): Promise<Book> {
    
    if (bookData.totalCopies && !bookData.availableCopies) {
      bookData.availableCopies = bookData.totalCopies;
    }
    
   
    if (!bookData.genre) {
      bookData.genre = 'General';
    }
    
    const book = this.bookRepository.create(bookData);
    return this.bookRepository.save(book);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, bookData: Partial<Book>): Promise<Book> {
    await this.findOne(id);
    
    
    if (bookData.totalCopies && !bookData.availableCopies) {
      bookData.availableCopies = bookData.totalCopies;
    }
    
    await this.bookRepository.update(id, bookData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    
    
    if (book.availableCopies < book.totalCopies) {
      throw new BadRequestException(
        `Cannot delete book. ${book.totalCopies - book.availableCopies} copy/copies are currently borrowed. All copies must be returned before deletion.`
      );
    }
    
    
    await this.borrowRequestRepository.delete({ bookId: id });
    await this.returnRequestRepository.delete({ bookId: id });
    await this.borrowedBookRepository.delete({ bookId: id });
    
    await this.bookRepository.remove(book);
  }

  async borrowBook(bookId: number, user: User): Promise<Book> {
    const book = await this.findOne(bookId);
    
    if (book.availableCopies <= 0) {
      throw new BadRequestException('No copies available for borrowing');
    }
    
    if (book.status !== BookStatus.AVAILABLE) {
      throw new BadRequestException('Book is not available for borrowing');
    }

    book.availableCopies -= 1;
    book.borrowedBy = user;
    book.borrowedAt = new Date();
    book.dueDate = new Date();
    book.dueDate.setDate(book.dueDate.getDate() + 14); // 14 days borrowing period
    
    if (book.availableCopies === 0) {
      book.status = BookStatus.BORROWED;
    }

    return this.bookRepository.save(book);
  }

  async returnBook(bookId: number, user: User): Promise<Book> {
    const book = await this.findOne(bookId);
    
    if (book.borrowedBy?.id !== user.id) {
      throw new BadRequestException('You have not borrowed this book');
    }

    book.availableCopies += 1;
    book.borrowedBy = null;
    book.borrowedAt = null;
    book.dueDate = null;
    book.status = BookStatus.AVAILABLE;

    return this.bookRepository.save(book);
  }

  async searchBooks(query: string): Promise<Book[]> {
    return this.bookRepository
      .createQueryBuilder('book')
      .where('book.title ILIKE :query OR book.author ILIKE :query OR book.genre ILIKE :query', {
        query: `%${query}%`,
      })
      .getMany();
  }
}

