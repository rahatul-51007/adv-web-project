import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtGuard } from './jwtGuard.guard';
import { RolesGuard } from './roles/roles.guard';
import { PasswordResetService } from './password-reset.service';
import { PasswordReset } from './password-reset.entity';
import { User } from '../users/users.entity';
import { EmailModule } from '../email/email.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtGuard,
    RolesGuard,
    PasswordResetService,
  ],
  imports: [
    UsersModule,
    EmailModule,
    TypeOrmModule.forFeature([PasswordReset, User]),
    JwtModule.register({
      global: true,
      secret: 'library-management-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class AuthModule {}
