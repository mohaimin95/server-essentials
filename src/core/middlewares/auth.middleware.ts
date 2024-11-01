import { cookieRefs, userTypes } from 'src/core/utils/constants';
import { UnauthorizedError } from 'src/core/errors';
import { IAuthRequest } from 'src/core/interfaces';
import { handleRoute } from 'src/core/utils';
import { TokenHelper } from '@@helpers';

const authMiddleware = (userType: string = userTypes.USER) =>
  handleRoute(async (req: IAuthRequest) => {
    if (req.tokenErr) {
      throw new UnauthorizedError('Unauthorized or expired session.');
    }

    await TokenHelper.validateAuthToken(
      req.signedCookies[cookieRefs.AUTH_TOKEN],
    );

    if (req.userType === userType || req.userType === userTypes.ADMIN)
      return {
        next: true,
      };
    throw new UnauthorizedError('Unauthorized.');
  });

export default authMiddleware;
