import { Model } from 'mongoose';

export default class PutData<T> {
  model: Model<T>;

  data: T[];

  constructor(model: Model<T>, data: T[]) {
    this.model = model;
    this.data = data;
  }

  private deleteAll() {
    return this.model.deleteMany({});
  }

  async putData() {
    await this.deleteAll();
    return this.model.insertMany(this.data);
  }
}
