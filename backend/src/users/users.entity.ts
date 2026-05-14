import { Column, 
    CreateDateColumn, 
    Entity, 
    PrimaryGeneratedColumn , 
    UpdateDateColumn } from 'typeorm';

export enum Role {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column(
    { type: 'enum', 
      enum: Role, 
      default: Role.MEMBER},
  )
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
