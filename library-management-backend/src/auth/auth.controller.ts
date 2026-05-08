import { Body, Controller, Post,Get,UseGuards,Param} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegistrationDto } from './user-registration.dto';
import { LoginDto } from './login.dto';
import { Users } from 'src/users/users.entity';
import { Public } from './public.decorator';
import { RolesGuard } from './roles/roles.guard';
import { Roles } from './roles/roles.decorator';
import { Role } from 'src/users/users.entity';
import { JwtGuard } from './jwtGuard.guard';
import { CurrentUser } from './current-user-decoretor';


@Controller('auth')
@UseGuards(JwtGuard, RolesGuard) 
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @Public()
    async register(@Body() userRegistrationDto: UserRegistrationDto) {
        return await this.authService.registerUser(userRegistrationDto);
    }
    @Post('login')
    @Public()
    async login(@Body() loginDto: LoginDto) {
        return await this.authService.login(loginDto);
    }

    @Get('current-user')
    @Roles(Role.ADMIN, Role.USER)
    getProfile(@CurrentUser() user: Users) {
        return user;
    }

    @Get('email')
    @Roles(Role.ADMIN, Role.USER)
    getEmail(@CurrentUser('email') email: string) {
        return { email };
    }

    @Get('all-users')
    @Roles(Role.ADMIN)
    async getAllUsers() {
        return await this.authService.findAllUsers();
    }

    @Get('user/:id')
    @Roles(Role.ADMIN)
    async getUserById(@Param('id') id: number) {
        return await this.authService.findUserById(id);
  }
}