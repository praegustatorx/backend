import dotenv from 'dotenv';
import app from './config/app';
import { Request, Response } from 'express';

import mongoose from 'mongoose';

const mongoString = process.env.DATABASE_URL as string;
mongoose.connect(mongoString);

const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

dotenv.config();

const port = process.env.PORT || 8000;

app.get('/test', (req: Request, res: Response): void => {
    res.status(200).json({
        message: 'server is running and the test endpoint is working! yipieee',
    });
});

app.listen(port, () => {
    console.log(`Server is running at https://localhost:${port}`);
});
