import { Injectable } from '@nestjs/common';
import { Users } from './users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRegistrationDto } from 'src/auth/user-registration.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  public async create(userRegistrationDto: UserRegistrationDto) {
    const user = this.userRepository.create(userRegistrationDto);
    return await this.userRepository.save(user);
  }
  public async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }
  public async findById(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }
  public async findAll() {
    return await this.userRepository.find();
  }
}
