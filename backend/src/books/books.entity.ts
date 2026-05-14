import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';

export enum BookStatus {
  AVAILABLE = 'available',
  BORROWED = 'borrowed',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  isbn: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  genre: string;

  @Column({ default: 1 })
  totalCopies: number;

  @Column({ default: 1 })
  availableCopies: number;

  @Column({
    type: 'enum',
    enum: BookStatus,
    default: BookStatus.AVAILABLE,
  })
  status: BookStatus;

  @ManyToOne(() => User, { nullable: true })
  borrowedBy: User;

  @Column({ nullable: true })
  borrowedAt: Date;

  @Column({ nullable: true })
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}