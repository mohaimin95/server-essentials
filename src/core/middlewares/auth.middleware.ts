import { userTypes } from 'src/core/utils/constants';
import { UnauthorizedError } from 'src/core/errors';
import { IAuthRequest } from 'src/core/interfaces';
import { handleRoute } from 'src/core/utils';

const authMiddleware = (userType: string = userTypes.USER) =>
  handleRoute(async (req: IAuthRequest) => {
    if (req.userType === userType || req.userType === userTypes.ADMIN)
      return {
        next: true,
      };
    throw new UnauthorizedError('Unauthorized.');
  });

export default authMiddleware;
