import { CookieParam } from 'src/core/types';

export default interface IController {
  statusCode?: number;
  response?: Record<string, any>;
  next?: boolean;
  append?: Record<string, any>;
  cookies?: CookieParam[];
}
