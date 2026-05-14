import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegistrationDto } from './user-registration.dto';
import { Public } from './public.decorator';
import { User } from 'src/users/users.entity';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        
    ) {}
    @Post('register')
    @Public()
    async register(@Body() userRegistrationDto: UserRegistrationDto) {
        return this.authService.registerUser(userRegistrationDto);
    }
    @Post('login')
    @Public()
    async login(@Body() loginDto) {
        return this.authService.login(loginDto);
    }

    @Get('current-user')
    
    getProfile(@CurrentUser() user: User) {
        return user;
    }

    @Get('email')

    getEmail(@CurrentUser('email') email: string) {
        return { email };
    }

    @Get('all-users')

    async getAllUsers() {
        return this.authService.findAllUsers();
    }

    @Get('user/:id')

    async getUserById(@Param('id') id: number) {
        return this.authService.findUserById(id);
    }

}
