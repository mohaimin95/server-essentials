import router from 'src/core/routes';
import express, { Express } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { mongooseConnect } from 'src/core/utils';
import './core/utils/redisClient';

mongooseConnect();

const app: Express = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SIGNED_SECRET));

app.get('/health-check', (__, res) => res.send('OK'));

app.use('/api/v1', router);

export default app;
