import {BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UserRegistrationDto } from './user-registration.dto';
import { LoginDto } from './login.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'crypto';
import { Users} from 'src/users/users.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    public async registerUser(userRegistrationDto: UserRegistrationDto) {
       const pass=userRegistrationDto.password;
       const hashedPass=await bcrypt.hash(pass,10);
       userRegistrationDto.password=hashedPass;
       return await this.usersService.create(userRegistrationDto);
    }
    public async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
        throw new BadRequestException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
        );
        if (!isPasswordValid) {
        throw new BadRequestException('Invalid email or password');
        }
        const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        };
        return {
        access_token: this.jwtService.sign(payload),
        };
    }

    public async findAllUsers() {
        return await this.usersService.findAll();
    }

    public async findUserById(id: number) {
        return await this.usersService.findById(id);
    }
}