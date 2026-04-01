import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password, body.phone);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    await this.authService.verifyOtp(body.email, body.otp);
    return { ok: true };
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: { email: string; purpose?: string }) {
    const otp = await this.authService.createOtp(
      body.email,
      body.purpose || 'register',
    );
    return { otp: otp.code, expiresAt: otp.expiresAt };
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokenPayload = await this.authService.login(
      body.email,
      body.password,
    );
    res.status(200);
    res.cookie('refreshToken', tokenPayload.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokenPayload.accessToken,
      user: tokenPayload.user,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Body() body: { refreshToken?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.status(200);
    const cookieRefresh: unknown = req.cookies?.refreshToken;
    const refresh =
      body.refreshToken ??
      (typeof cookieRefresh === 'string' ? cookieRefresh : undefined);
    if (!refresh) {
      return { error: 'Refresh token missing' };
    }

    const tokenPayload = await this.authService.refresh(refresh);
    res.cookie('refreshToken', tokenPayload.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokenPayload.accessToken,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.sub);
    res.clearCookie('refreshToken');
    return { ok: true };
  }
}
