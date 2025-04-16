import dotenv from 'dotenv';
import app from './config/app';
import { Request, Response } from 'express';
import connectDB from './database';
import { startTerminalChat } from './chatbot/tui';
import { CreateGemini } from './chatbot/gemini';
// import { startTerminalChat } from './chatbot';
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


if (process.argv.includes('--chat')) {
    console.warn(`${"\x1b[33m"}Running only the chat terminal.${"\x1b[0m"}`);
    startTerminalChat();
} else {
    startServer();
}