import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import readline from 'readline';
import { Result, Ok, Err, Option, Some, None } from 'ts-results-es';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey });
const model = ai.models;

// TODO: the model should be an input parameter
// --- Function to make a simple API call ---
export const runBasicQuery = async (promptText: string): Promise<Result<Option<string>, Error>> => {
    try {
        // Generating result (REMEMBER: Stateless)
        const result = await model.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: promptText,
        });
        const text = result.text;
        const response = text ? Some(text) : None;
        return Ok(response);
    } catch (error) {
        return Err(error instanceof Error ? error : new Error("Unknown error calling Gemini API"));
    }
}

// Function to read from terminal and send to Gemini
export const startTerminalChat = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("=== Gemini Terminal Chat ===");
    console.log("Type your questions or 'exit' to quit");
    console.log("===========================");

    const askQuestion = () => {
        rl.question('You: ', async (input) => {
            if (input.toLowerCase() === 'exit') {
                console.log('Goodbye!');
                rl.close();
                return;
            }

            try {
                console.log('Gemini: ');
                const response = await runBasicQuery(input);
                if (response.isOk()) {
                    const inner = response.unwrap();
                    const output = inner.isSome() ? inner.unwrap() : "No response received.";
                    console.log(output);
                } else {
                    console.log(`Error: ${response.unwrapErr().message}`);
                }
            } catch (error) {
                console.log(`Error getting response: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }

            // Continue asking questions
            askQuestion();
        });
    };

    askQuestion();
};
