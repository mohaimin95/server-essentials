import { userTypes } from 'src/core/utils/constants';
import { getKeyByUserType } from 'src/core/utils/functions';
import { JWTService } from 'src/core/services';
import { handleRoute } from 'src/core/utils';
import { Request } from 'express';

const sniffAuthToken = async (req: Request) => {
  let append;
  const { authToken } = req.signedCookies;
  if (typeof authToken === 'string') {
    const [, token] = authToken.split(' ');
    if (token) {
      try {
        const decoded = await JWTService.verifyToken(
          token,
          getKeyByUserType(userTypes.ADMIN),
        );

        append = {
          user: decoded,
          isAdmin: true,
          userType: userTypes.ADMIN,
        };
        // eslint-disable-next-line no-empty, @typescript-eslint/no-unused-vars
      } catch (ex) {}
      if (!append?.isAdmin) {
        try {
          const decoded = await JWTService.verifyToken(token);
          append = { user: decoded, userType: userTypes.USER };
          // eslint-disable-next-line no-empty, @typescript-eslint/no-unused-vars
        } catch (ex) {}
      }
    }
  }
  return {
    next: true,
    append,
  };
};

export default handleRoute(sniffAuthToken);
