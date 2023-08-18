import { Request, Response } from 'express';
import {name, version} from '../package.json';

import './api/v1';

import app from './server';

app.get('/', async (req: Request, res: Response) => {
  res.send({
    name,
    version,
    online: true,
  });
});

export default app;