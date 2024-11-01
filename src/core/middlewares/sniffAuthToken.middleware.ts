import { cookieRefs, userTypes } from 'src/core/utils/constants';
import { getKeyByUserType } from 'src/core/utils/functions';
import { JWTService } from 'src/core/services';
import { handleRoute } from 'src/core/utils';
import { Request } from 'express';

const sniffAuthToken = async (req: Request) => {
  let append: any = {};
  const authToken = req.signedCookies[cookieRefs.AUTH_TOKEN];
  if (typeof authToken === 'string') {
    const token = authToken;
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
      } catch (ex) {
        append.tokenErr = ex;
      }
      if (!append?.isAdmin) {
        try {
          const decoded = await JWTService.verifyToken(token);
          append = { user: decoded, userType: userTypes.USER };
        } catch (ex) {
          append.tokenErr = ex;
        }
      }
    }
  }
  return {
    next: true,
    append,
  };
};

export default handleRoute(sniffAuthToken);
