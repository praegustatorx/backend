import dotenv from 'dotenv';
import app from './config/app';
import { Request, Response } from 'express';
import connectDB from './database';
import { GoogleGenerativeAI } from "@google/generative-ai";
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


const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

// Initialize the GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI(apiKey);

// Choose a model (e.g., gemini-1.5-flash-latest or gemini-pro)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// --- Function to make a simple API call ---
async function runBasicQuery(promptText: string) {
    try {
        console.log(`Sending prompt: "${promptText}"`);

        // Generating result (REMEMBER: Stateless)
        const result = await model.generateContent(promptText);
        const response = result.response;
        const text = response.text();

        console.log("Received response:");
        console.log(text);
        return text;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

// --- Example Usage ---
async function main() {
    const prompt = "Explain what an API key is in simple terms.";
    await runBasicQuery(prompt).catch(console.error);
}