import { UserHelper } from '@@helpers';
import { redisClient } from '@@utils';
import { BcryptService } from '@@services';
import { normalizeString } from '@@functions';
import { NotFoundError, UnauthorizedError } from '@@errors';
import EmailHelper from './email.helper';

export default class PasswordHelper {
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }

  private static getCacheKey(email: string): string {
    return `fpwd::${normalizeString(email)}`;
  }

  public static async requestResetPasswordCode(
    email: string,
  ): Promise<void> {
    const normalizedEmail = normalizeString(email);
    const user = await UserHelper.getUserByEmail(normalizedEmail);

    if (!user) throw new NotFoundError('User not found');
    const otpCode = PasswordHelper.generateOTP();
    const otp = await BcryptService.createHash(otpCode);

    const emailHelper = new EmailHelper();
    await emailHelper.sendEmail({
      from: 'abdul.devmode@gmail.com',
      to: [normalizedEmail],
      subject: 'OTP for password',
      html: `
            <p>OTP for resetting password is <strong>${otpCode}</strong>.</p>
        `,
    });

    // Store OTP in Redis with a 15-minute expiration
    await redisClient.hset(PasswordHelper.getCacheKey(email), {
      otp,
    });
    await redisClient.expire(PasswordHelper.getCacheKey(email), 900);

    // Send OTP to the user (use your email helper or SMS service)
  }

  public static async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    const hashedOtp = await redisClient.hget(
      PasswordHelper.getCacheKey(normalizeString(email)),
      'otp',
    );

    if (
      !hashedOtp ||
      !(await BcryptService.compareHash(otp, hashedOtp))
    )
      throw new UnauthorizedError('Invalid or expired OTP');

    const hashedPassword =
      await BcryptService.createHash(newPassword);
    await UserHelper.updatePasswordByEmail(email, hashedPassword);

    // Optionally, delete the OTP from Redis after successful password reset
    await redisClient.hdel(PasswordHelper.getCacheKey(email), 'otp');
  }
}
