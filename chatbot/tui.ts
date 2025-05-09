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

// Define the print handler type
type PrintHandler = (chatId: string, promptText: string) => Promise<void>;

// Function to create a stream print handler
const createStreamPrintHandler = (): PrintHandler => {
    return async (chatId: string, promptText: string) => {
        const stream = await AskGeminiStream(chatId, promptText);
        if (stream.isOk()) {
            await printStream(stream.unwrap());
        } else {
            console.error(`Error: ${stream.unwrapErr().message}`);
        }
    };
};

// Function to create a non-stream print handler
const createNormalPrintHandler = (): PrintHandler => {
    return async (chatId: string, promptText: string) => {
        const response = await AskGemini(chatId, promptText);
        if (response.isOk()) {
            printResponse(response.unwrap());
        } else {
            console.error(`Error: ${response.unwrapErr().message}`);
        }
    };
};

// Function to read from terminal and send to Gemini
export const startTerminalChat = (inChunks: boolean) => {
    const rl = initReadline();
    // Create the appropriate handler based on inChunks
    const printHandler = inChunks ? createStreamPrintHandler() : createNormalPrintHandler();

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
                await printHandler(chatId, promptText);
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
    console.log(); // Add newline after stream completes
}

const printResponse = (response: Option<string>) => {
    response.isSome() ? console.log(response.unwrap()) : console.log("No response received.");
}