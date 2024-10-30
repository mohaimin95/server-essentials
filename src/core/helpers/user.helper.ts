// UserHelper.ts

import { ConflictError } from '@@errors';
import { normalizeString } from '@@functions';
import { IUser } from '@@interfaces';
import { User } from '@@models';

export default class UserHelper {
  public static async getUserByEmail(email: string) {
    return User.findOne({ email }).select('-password'); // Exclude password for security
  }

  public static async updatePasswordByEmail(
    email: string,
    password: string,
  ) {
    return User.updateOne(
      { email: normalizeString(email) },
      {
        $set: {
          password,
        },
      },
    ); // Exclude password for security
  }

  public static async getUserById(id: String, select = '-password') {
    return User.findById(id).select(select);
  }

  public static async getActiveUserById(
    id: String,
    select = '-password',
  ) {
    return User.findOne({ _id: id, isActive: true }).select(select);
  }

  static async createUser(user: Partial<IUser>) {
    const newUser = await new User(user);
    return newUser.save();
  }

  static async checkEmailOrPhoneExists(email: string, phone: string) {
    const user = await User.findOne(
      {
        $or: [
          {
            email: normalizeString(email),
          },
          {
            phone: normalizeString(phone),
          },
        ],
      },
      { email: 1, phone: 1 },
    );
    if (user) {
      if (normalizeString(user.email) === normalizeString(email)) {
        throw new ConflictError('Email already exists.');
      }
      if (normalizeString(user.phone) === normalizeString(phone)) {
        throw new ConflictError('Phone no. already exists.');
      }
    }
  }
}
