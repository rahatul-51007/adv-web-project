import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Book } from '../books/books.entity';
import { BorrowedBook } from '../borrowed-books/borrowed-book.entity';

export enum ReturnRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('return_requests')
export class ReturnRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column()
  bookId: number;

  @ManyToOne(() => BorrowedBook)
  @JoinColumn({ name: 'borrowId' })
  borrowedBook: BorrowedBook;

  @Column()
  borrowId: number;

  @Column({
    type: 'enum',
    enum: ReturnRequestStatus,
    default: ReturnRequestStatus.PENDING,
  })
  status: ReturnRequestStatus;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
