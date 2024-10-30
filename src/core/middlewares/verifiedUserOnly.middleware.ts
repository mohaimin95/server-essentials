import { ForbiddenEntryError } from 'src/core/errors';
import { IAuthRequest } from 'src/core/interfaces';
import { handleRoute } from 'src/core/utils';

const verifiedUserOnly = (req: IAuthRequest) => {
  const { phoneConfirmedAt, emailConfirmedAt, isActive } =
    req?.user || {};
  if (!phoneConfirmedAt || !emailConfirmedAt || !isActive) {
    throw new ForbiddenEntryError(
      'User is not fully verified/active',
      {
        redirect: true,
        phoneConfirmedAt,
        emailConfirmedAt,
      },
    );
  }
  return {
    next: true,
  };
};

export default handleRoute(verifiedUserOnly);
