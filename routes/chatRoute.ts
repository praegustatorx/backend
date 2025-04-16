import express from 'express';
import { Request, Response } from 'express';
import { AskGemini } from '../chatbot/gemini';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    const { id, message } = req.body;
    const response = await AskGemini(id, message);
    if (response.isErr()) {
        res.status(500).json({ error: response.unwrapErr().message });
    }
    const inner = response.unwrap();
    const result = inner.isSome() ? inner.unwrap() : "No response received.";
    res.send(result);
});

export default router;