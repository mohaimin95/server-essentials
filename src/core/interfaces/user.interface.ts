export default interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roleId: String;
  emailConfirmedAt: Date;
  phoneConfirmedAt: Date;
  password: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updateAt?: Date;
}
