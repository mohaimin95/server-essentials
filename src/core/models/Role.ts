import { DbCollections } from 'src/core/utils/constants';
import { Schema, model } from 'mongoose';
import IRole from 'src/core/interfaces/role.interface';

const schema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model(DbCollections.ROLE, schema);
