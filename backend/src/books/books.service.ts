import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book, BookStatus } from './books.entity';
import { User } from '../users/users.entity';

@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(Book) 
        private bookRepository: Repository<Book>,
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


    await this.bookRepository.remove(book);
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
