import { DbCollections } from 'src/core/utils/constants';
import { IUser } from 'src/core/interfaces';
import { Schema, Types, model } from 'mongoose';
import { roles } from 'src/core/utils/dataConstants';

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    roleId: {
      type: Types.ObjectId,
      required: true,
      ref: DbCollections.ROLE,
      default: roles.CUSTOMER,
    },
    emailConfirmedAt: Date,
    phoneConfirmedAt: Date,
    password: {
      type: String,
      required: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  },
);

export default model(DbCollections.USER, UserSchema);
