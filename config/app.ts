import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'

import authRoter from '../routes/authRoute';
import fileUploadRouter from '../routes/fileUploadRoute';
import preferencesRouter from '../routes/preferencesRoute';
import chatRouter from '../routes/chatRoute';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoter);
app.use('/file', fileUploadRouter);
app.use('/chat', chatRouter);
app.use('/preferences', preferencesRouter)

export default app;