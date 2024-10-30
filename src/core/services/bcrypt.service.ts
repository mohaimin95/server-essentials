import { hash, genSalt, compare } from 'bcryptjs';

export default class BcryptService {
  static rounds: number = 12;

  static async createHash(input: string): Promise<string> {
    const salt: string = await genSalt(BcryptService.rounds);
    const result: string = await hash(input, salt);
    return result;
  }

  static async compareHash(
    plain: string,
    hashString: string,
  ): Promise<boolean> {
    return compare(plain, hashString);
  }
}
