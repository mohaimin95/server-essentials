import { IUser } from 'src/core/interfaces';
import { UserService } from 'src/core/services';
import { handleRoute } from 'src/core/utils';

const validateUser = async (req: any) => {
  const user: IUser = await UserService.validate(req.user._id);
  return {
    next: true,
    append: { user },
  };
};

export default handleRoute(validateUser);
