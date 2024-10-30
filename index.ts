import './pre-start';
import { logger } from 'src/core/utils';
import app from './src/app';

app.listen(process.env.PORT, () => {
  logger.info(`APP started listening on PORT ${process.env.PORT}`);
});
