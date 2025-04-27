import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'

import authRoter from '../routes/authRoute';
import fileUploadRouter from '../routes/fileUploadRoute';
import preferencesRouter from '../routes/preferencesRoute';
import pantryRouter from '../routes/pantryRoute';
import cookbookRouter from '../routes/cookbookRoute';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoter);
app.use('/file', fileUploadRouter);
app.use('/preferences', preferencesRouter)
app.use('/pantry', pantryRouter)
app.use('/cookbook', cookbookRouter);

export default app;