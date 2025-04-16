import { None, Result, Some, Option, Ok, Err } from "ts-results-es";
import * as readline from 'readline';
import { AskGemini, Gemini } from "./gemini";

export const runBasicQuery = async (model: Gemini, chatId: string, promptText: string): Promise<Result<Option<string>, Error>> => {
    return AskGemini(model, chatId, promptText);
}

// Function to read from terminal and send to Gemini
export const startTerminalChat = (model:Gemini) => {
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

            const parts = input.split('|');
            const chatId = parts[0].trim();
            const promptText = parts[1].trim();

            try {
                console.log('Gemini: ');
                const response = await runBasicQuery(model, chatId, promptText);
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