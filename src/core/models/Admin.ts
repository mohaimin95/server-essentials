import { DbCollections } from 'src/core/utils/constants';
import { IAdmin } from 'src/core/interfaces';
import { Schema, model } from 'mongoose';

const UserSchema: Schema<IAdmin> = new Schema(
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

export default model(DbCollections.ADMIN, UserSchema);
