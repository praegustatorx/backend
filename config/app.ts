import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'

import authRoter from '../routes/authRoute';
import fileUploadRouter from '../routes/fileUploadRoute';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoter);
app.use('/file', fileUploadRouter);

export default app;