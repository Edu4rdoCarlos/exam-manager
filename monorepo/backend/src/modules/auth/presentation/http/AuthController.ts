import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Login } from '../../application/services/Login';
import { LoginDto } from './dto/LoginDto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginService: Login) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.loginService.execute(dto);
    if (!result.ok) throw new UnauthorizedException();
    return result.value;
  }
}
