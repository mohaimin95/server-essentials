export default interface IAdmin {
  _id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updateAt?: Date;
}
