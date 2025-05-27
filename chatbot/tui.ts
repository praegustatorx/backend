import * as readline from 'readline';
import { AskGemini, AskGeminiStream, FetchNutrientInfo } from "./gemini";
import { GenerateContentResponse } from "@google/genai";

const initReadline = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
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
            console.log(response.unwrap());
        } else {
            console.error(`Error: ${response.unwrapErr().message}`);
        }
    };
};

// Function to read from terminal and send to Gemini
export const startTerminalChat = (inChunks: boolean) => {
    const rl = initReadline();

    console.log("=== Gemini Terminal Chat ===");
    console.log("Type your questions or 'exit' to quit");
    console.log("============================");
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

export const askNutrientInfo = async () => {
    const rl = initReadline();

    rl.question('Enter ingredient name: ', async (ingredientName) => {
        if (!ingredientName.trim()) {
            console.log("Ingredient name cannot be empty.");
            rl.close();
            return;
        }

        console.log(`Fetching nutrient info for: ${ingredientName}`);
        try {
            const result = await FetchNutrientInfo(ingredientName.trim());
            if (result.isOk()) {
                const nutrientInfo = result.unwrap();
                console.log("Product Type:", nutrientInfo.type);
                if (nutrientInfo.nutrition.isSome()) {
                    const info = nutrientInfo.nutrition.unwrap();
                    console.log("Nutritional Information:");
                    console.log("Calories:", info.calories);
                    console.log("Protein:", info.protein);
                    console.log("Fat:", info.fat);
                    console.log("Carbohydrates:", info.carbohydrates);
                } else {
                    console.log("No nutritional information found.");
                }
            } else {
                console.error(`Error fetching nutrient info: ${result.unwrapErr().message}`);
            }
        } catch (error) {
            console.error(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            rl.close();
        }
    });
};