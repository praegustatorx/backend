import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'

import authRoter from '../routes/authRoute';
import fileUploadRouter from '../routes/fileUploadRoute';
import preferencesRouter from '../routes/preferencesRoute';
import chatRouter from '../routes/chatRoute';
import pantryRouter from '../routes/pantryRoute';
import cookbookRouter from '../routes/cookbookRoute';
import chatRoute from '../routes/chatRoute';
import modelRouter from '../routes/modelRoute'; // Import the new model router

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoter);
app.use('/file', fileUploadRouter);
app.use('/chat', chatRouter);
app.use('/preferences', preferencesRouter)
app.use('/pantry', pantryRouter)
app.use('/cookbook', cookbookRouter);
app.use('/chat', chatRoute);
app.use('/model', modelRouter);
console.log("Chat route loaded successfully");

export default app;