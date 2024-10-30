import { PutData } from 'src/core/utils';
import { Role } from 'src/core/models';
import roleData from './roles';

const putData: PutData<any>[] = [new PutData(Role, roleData)];

const initData = () => Promise.all(putData.map((d) => d.putData()));

export default initData;
