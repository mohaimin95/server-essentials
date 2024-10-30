// AdminHelper.ts

import { Admin } from '@@models';

export default class AdminHelper {
  public static async getAdminById(id: String, select = '-password') {
    return Admin.findById(id).select(select);
  }

  public static async getActiveAdminById(
    id: String,
    select = '-password',
  ) {
    return Admin.findOne({ _id: id, isActive: true }).select(select);
  }
}
