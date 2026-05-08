import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

export enum Role{
    ADMIN = 'admin',
    USER = 'user',
}
@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;
  @Column(
    {
        type: 'varchar',
        unique: true,
        length: 255,
        nullable: false,
    }
  )
  email: string;

  @Column(
    {
        type: 'varchar',
        length: 255,
        nullable: false,
    }
  )
  password: string;

  @Column(
    {
        type: 'enum',
        enum: Role,
        default: Role.USER,
    }
  )
  role: Role;
}