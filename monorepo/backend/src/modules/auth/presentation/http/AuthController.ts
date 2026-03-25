import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Login } from '../../application/services/Login';
import { HttpResponse, HttpResponseBody } from '../../../../shared/utils/HttpResponse';
import { LoginDto } from './dto/LoginDto';
import { LoginDocs } from './docs/auth.docs';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginService: Login) {}

  @Post('login')
  @LoginDocs()
  async login(@Body() dto: LoginDto): Promise<HttpResponseBody<unknown>> {
    const result = await this.loginService.execute(dto);
    if (!result.ok) throw new UnauthorizedException();
    return HttpResponse.of(result.value);
  }
}
