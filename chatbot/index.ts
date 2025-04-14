import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import readline from 'readline';
import { Result, Ok, Err } from 'ts-results-es';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

// Initialize the GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI(apiKey);

// Choose a model (e.g., gemini-1.5-flash-latest or gemini-pro)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// --- Function to make a simple API call ---
export const runBasicQuery = async (promptText: string): Promise<Result<string, Error>> => {
    try {
        // Generating result (REMEMBER: Stateless)
        const result = await model.generateContent(promptText);
        const response = result.response;
        return Ok(response.text());

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
                    console.log(response.unwrap());
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
