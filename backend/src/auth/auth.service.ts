import {
  BadRequestException,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import type { Otp } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, phone?: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      email,
      phone,
      password: hashedPassword,
      roles: ['buyer'],
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
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new InternalServerErrorException('Email service is not configured');
    }

    try {
      await this.transporter.sendMail({
        from: `"Nen Tang Lang Nghe" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Ma OTP xac thuc',
        html: `<p>Ma xac thuc cua ban la <strong>${code}</strong>. Het han sau 5 phut.</p>`,
      });
    } catch (error) {
      console.error('Failed to send OTP email via Gmail', error);
      throw new InternalServerErrorException('Khong the gui email OTP luc nay');
    }
  }

  async createOtp(email: string, purpose = 'register'): Promise<Otp> {
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otp = await this.prisma.otp.create({
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
    const otp = await this.prisma.otp.findFirst({
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

    await this.prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    if (purpose === 'register') {
      await this.prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      });
    }

    return true;
  }

  private async hasVerifiedRegisterOtp(email: string): Promise<boolean> {
    const verifiedOtp = await this.prisma.otp.findFirst({
      where: {
        email,
        purpose: 'register',
        used: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return Boolean(verifiedOtp);
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

    let isVerified = user.isEmailVerified;
    if (!isVerified) {
      const hasVerifiedOtp = await this.hasVerifiedRegisterOtp(email);
      if (hasVerifiedOtp) {
        await this.prisma.user.update({
          where: { email },
          data: { isEmailVerified: true },
        });
        isVerified = true;
      }
    }

    if (!isVerified) {
      throw new UnauthorizedException(
        'Email chưa xác thực. Vui lòng xác thực OTP trước khi đăng nhập',
      );
    }

    const roles = user.roles.map((item) => item.role);
    const payload: JwtPayload = { sub: user.id, email: user.email, roles };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: await bcrypt.hash(refreshToken, 10),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, roles },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      const persisted = await this.prisma.refreshToken.findFirst({
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

      const roles = user.roles.map((r) => r.role);
      const newPayload: JwtPayload = { sub: user.id, email: user.email, roles };

      return {
        accessToken: this.jwtService.sign(newPayload, { expiresIn: '15m' }),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
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
