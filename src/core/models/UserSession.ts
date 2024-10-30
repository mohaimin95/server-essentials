import { DbCollections } from 'src/core/utils/constants';
import { IUserSession } from 'src/core/interfaces';
import { Schema, Types, model } from 'mongoose';

const UserSession: Schema<IUserSession> = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
    },
    rotations: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default model(DbCollections.USER_SESSION, UserSession);
