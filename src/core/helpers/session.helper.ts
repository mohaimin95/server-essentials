import { ForbiddenEntryError, UnauthorizedError } from '@@errors';
import { ObjectId } from '@@functions';
import { UserSession } from '@@models';
import UserHelper from './user.helper';
import AdminHelper from './admin.helper';

export default class SessionHelper {
  static async createSession(userId: string, isAdmin = false) {
    const getUserById = isAdmin
      ? AdminHelper.getActiveAdminById
      : UserHelper.getActiveUserById;
    const user = await getUserById(userId);
    if (!user?.isActive) {
      throw new ForbiddenEntryError(
        'User is not allowed to access the resources.',
      );
    }

    const session = new UserSession({
      userId: user._id,
      rotations: 0,
    });

    return session.save();
  }

  static async checkAndGetSession(sessionId: string) {
    const session = await UserSession.findById(sessionId);
    if (!session) {
      throw new UnauthorizedError('Session invalid or expired');
    }
    return session;
  }

  static async updateRotation(sessionId: string) {
    return UserSession.updateOne(
      { _id: ObjectId(sessionId) },
      { $inc: { rotations: 1 } },
    );
  }
}
