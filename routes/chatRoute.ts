import express from "express";
import { Request, Response } from "express";
import { AskGemini, AskGeminiStream } from "../chatbot/gemini";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { id, message } = req.body;
  const response = await AskGemini(id, message);
  if (response.isErr()) {
    res.status(500).json({ error: response.unwrapErr().message });
    return;
  }
  const inner = response.unwrap();
  const result = inner.isSome() ? inner.unwrap() : "No response received.";
  res.status(200).send({ message: result });
});

router.post("/stream", async (req: Request, res: Response) => {
  const { id, message } = req.body;
  const stream = await AskGeminiStream(id, message);
  if (stream.isErr()) {
    res.status(500).json({ error: stream.unwrapErr().message });
    return;
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  for await (const next of stream.unwrap()) {
    if (res.writableEnded) {
      console.warn("Response has ended, skipping write.");
      break;
    }
    res.write(`data: ${next.text ?? ""}\n`);
  }
  res.end();
})

export default router;
