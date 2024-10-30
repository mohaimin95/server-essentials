import {
  IAdmin,
  IChangePasswordRequest,
  ILogin,
  ISignUp,
} from '@@interfaces';
import { Admin } from '@@models';
import {
  ForbiddenEntryError,
  NotFoundError,
  ValidationError,
} from '@@errors';
import { ObjectId } from '@@functions';
import { userTypes } from '@@constants';
import AuthService from './auth.service';
import BcryptService from './bcrypt.service';

export default class AdminService {
  static async signUp({ email, phone, name, password }: ISignUp) {
    const admin: IAdmin | null = await Admin.findOne(
      {
        $or: [
          {
            email: email.trim().toLowerCase(),
          },
          {
            phone,
          },
        ],
      },
      { email: 1, phone: 1 },
    );
    if (admin) {
      if (
        admin.email.trim().toLowerCase() ===
        email.trim().toLowerCase()
      ) {
        throw new ValidationError('Email already exists.');
      }
    }
    await new Admin({
      name,
      email,
      phone,
      password: await BcryptService.createHash(password),
    }).save();
    return AuthService.signInWithPwd(
      Admin,
      {
        email,
        password,
        phone,
      },
      userTypes.ADMIN,
    );
  }

  static async login(body: ILogin) {
    const response = await AuthService.signInWithPwd(
      Admin,
      body,
      userTypes.ADMIN,
    );
    return response;
  }

  static async get(id: string): Promise<IAdmin | null | undefined> {
    const admin: IAdmin | null = await Admin.findById(id);
    if (!admin) {
      throw new NotFoundError('Admin not found.');
    }
    return admin;
  }

  static async validate(adminId: string): Promise<IAdmin> {
    const admin: IAdmin = (await Admin.findById(adminId)) as IAdmin;
    if (!admin) {
      throw new NotFoundError('Admin not found.');
    }
    const { isActive } = admin;
    if (!isActive) {
      throw new ForbiddenEntryError(
        'Access denied. Please contact support.',
      );
    }

    return admin;
  }

  static async changePassword(
    adminId: string | undefined,
    data: IChangePasswordRequest,
  ) {
    if (!adminId) {
      throw new NotFoundError('Admin not found.');
    }

    const admin: IAdmin = (await Admin.findOne(ObjectId(adminId), {
      password: 1,
    })) as IAdmin;
    if (!admin) {
      throw new NotFoundError('Admin not found.');
    }
    if (
      await BcryptService.compareHash(
        data?.oldPassword as string,
        admin.password,
      )
    ) {
      const hash: string = await BcryptService.createHash(
        data?.newPassword as string,
      );
      await Admin.updateOne(
        {
          _id: adminId,
        },
        {
          $set: {
            password: hash,
          },
        },
      );
    } else {
      throw new ValidationError('Old password is incorrect.');
    }
  }
}
