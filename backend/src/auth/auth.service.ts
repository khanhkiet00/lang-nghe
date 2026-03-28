import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, phone?: string, role = 'buyer') {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      email,
      phone,
      password: hashedPassword,
      roles: [role],
    });

    const otp = await this.createOtp(email, 'register');

    return {
      user: { id: user.id, email: user.email },
      otp: otp.code,
      expiresAt: otp.expiresAt,
    };
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOtpEmail(email: string, code: string) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY undefined, OTP not sent to email');
      return;
    }

    try {
      await axios.post(
        'https://api.resend.com/emails',
        {
          from: process.env.EMAIL_FROM || 'noreply@example.com',
          to: email,
          subject: 'Mã OTP xác thực',
          html: `<p>Mã xác thực của bạn là <strong>${code}</strong>. Hết hạn sau 5 phút.</p>`,
        },
        {
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error('Failed to send OTP email', error);
    }
  }

  async createOtp(email: string, purpose: string = 'register') {
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otp = await (this.prisma as any).otp.create({
      data: {
        email,
        code,
        purpose,
        expiresAt,
      },
    });

    await this.sendOtpEmail(email, code);
    return otp;
  }

  async verifyOtp(email: string, otpCode: string, purpose = 'register') {
    const otp = await (this.prisma as any).otp.findFirst({
      where: {
        email,
        code: otpCode,
        purpose,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.used || otp.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP không hợp lệ hoặc đã hết hạn');
    }

    await (this.prisma as any).otp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return true;
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const roles = (user as any).roles?.map((item) => item.role) ?? [];
    const payload: JwtPayload = { sub: user.id, email: user.email, roles };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    await (this.prisma as any).refreshToken.create({
      data: {
        userId: user.id,
        token: await bcrypt.hash(refreshToken, 10),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, roles } };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      const persisted = await (this.prisma as any).refreshToken.findFirst({
        where: {
          userId: payload.sub,
          revoked: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!persisted) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const matches = await bcrypt.compare(refreshToken, persisted.token);
      if (!matches) {
        throw new UnauthorizedException('Refresh token không hợp lệ');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }

      const roles = (user as any).roles?.map((r) => r.role) ?? [];
      const newPayload: JwtPayload = { sub: user.id, email: user.email, roles };

      return {
        accessToken: this.jwtService.sign(newPayload, { expiresIn: '15m' }),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  async logout(userId: string) {
    await (this.prisma as any).refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    return { ok: true };
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      return null;
    }
    return user;
  }
}
