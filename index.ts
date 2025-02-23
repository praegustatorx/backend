import dotenv from 'dotenv';
import app from './config/app';
import { Request, Response } from 'express';

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
