import { roles } from 'src/core/utils/dataConstants';
import { IRole } from 'src/core/interfaces';

const data: IRole[] = [
  {
    _id: roles.CUSTOMER,
    name: 'Customer',
  },
  {
    _id: roles.SUPER_USER,
    name: 'Super User',
  },
];

export default data;
