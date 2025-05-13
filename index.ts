import dotenv from 'dotenv';
import app from './config/app';
import { Request, Response } from 'express';
import connectDB from './database';
import { askNutrientInfo, startTerminalChat } from './chatbot/tui';
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

const args = process.argv;
if (args.includes('--chat')) {
    console.warn(`${"\x1b[33m"}Running only the chat terminal.${"\x1b[0m"}`);
    startTerminalChat(false);
} else if (args.includes('--chat-stream')) {
    console.warn(`${"\x1b[33m"}Running only the chat terminal with stream responses.${"\x1b[0m"}`);
    startTerminalChat(true);
} else if (args.includes('--model')) {
    console.warn(`${"\x1b[33m"}Running only in the terminal with nutritional information responses.${"\x1b[0m"}`);
    askNutrientInfo();
}
else {
    startServer();
}