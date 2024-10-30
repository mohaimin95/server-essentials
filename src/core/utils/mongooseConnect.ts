import mongoose from 'mongoose';
import logger from './logger';

const mongooseConnect = (): void => {
  const DB = String(process.env.DB);
  mongoose.set('strictQuery', true);
  mongoose.connect(DB);

  mongoose.connection.on('connected', async () => {
    logger.info('DB Connected 👍');
  });
  mongoose.connection.on('error', (err) => {
    logger.info('Error while connecting to DB ❌', err);
  });
  mongoose.connection.on('disconnected', () => {
    logger.info('DB Disconnected 💔');
  });
};

export default mongooseConnect;
