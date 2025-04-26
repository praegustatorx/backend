import { None, Result, Some, Option, Ok, Err } from "ts-results-es";
import * as readline from 'readline';
import { AskGemini, AskGeminiStream, Gemini } from "./gemini";
import { match } from "assert";
import { GenerateContentResponse } from "@google/genai";


const initReadline = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    console.log("=== Gemini Terminal Chat ===");
    console.log("Type your questions or 'exit' to quit");
    console.log("============================");
    return rl;
}

// Function to read from terminal and send to Gemini
export const startTerminalChat = (inChunks: boolean) => {
    const rl = initReadline();
    const askQuestion = async () => {
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

                if (inChunks) {
                    const stream = await AskGeminiStream(chatId, promptText);
                    stream.isOk() ? printStream(stream.unwrap()) : console.error(`Error: ${stream.unwrapErr().message}`);
                } else {
                    const response = await AskGemini(chatId, promptText);
                    response.isOk() ? printResponse(response.unwrap()) : console.error(`Error: ${response.unwrapErr().message}`);
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

const printStream = async (stream: AsyncGenerator<GenerateContentResponse>) => {
    for await (const next of stream) {
        process.stdout.write(next.text ?? "");
    }
}

const printResponse = (response: Option<string>) => {
    response.isSome() ? console.log(response.unwrap()) : console.log("No response received.");
}
