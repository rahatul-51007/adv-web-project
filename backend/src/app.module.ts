import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { BorrowRequestsModule } from './borrow-requests/borrow-requests.module';
import { BorrowedBooksModule } from './borrowed-books/borrowed-books.module';
import { ReturnRequestsModule } from './return-requests/return-requests.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'library_management',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    BooksModule,
    BorrowRequestsModule,
    BorrowedBooksModule,
    ReturnRequestsModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
