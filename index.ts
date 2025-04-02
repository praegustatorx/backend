import dotenv from 'dotenv';
import app from './config/app';
import { Request, Response } from 'express';
import connectDB from './database';
dotenv.config();


const port = process.env.PORT || 8000;

const startServer = async () => {
    await connectDB();

    app.listen(port, () => {
        console.log(`Server is running at https://localhost:${port}`);
    });

    app.get('/test', (req: Request, res: Response): void => {
        res.status(200).json({
            message: 'server is running and the test endpoint is working! yipieee',
        });
    });
}

startServer();