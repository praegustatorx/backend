import { Chat, GoogleGenAI } from '@google/genai';
import { Result, Ok, Err, Option, Some, None } from 'ts-results-es';
// import { BaseChatbot } from '..';

export type Gemini = {
    genai: GoogleGenAI;
    chats: Map<string, Chat>;
}

export const CreateGemini = (apiKey: string): Gemini => {
    const genai = new GoogleGenAI({ apiKey });
    const chats = new Map<string, Chat>();

    return { genai, chats };
}

// TODO: the model should be an input parameter
const StartNewChat = (self: Gemini, chatId: string): Chat => {
    let chat: Chat;
    if (self.chats.has(chatId)) {
        chat = self.chats.get(chatId)!;
    } else {
        chat = self.genai.chats.create({ model: 'gemini-2.0-flash-001' });
        self.chats.set(chatId, chat);
    }
    return chat;
}

export const AskGemini = async (self: Gemini, chatId: string, message: string): Promise<Result<Option<string>, Error>> => {
    const userChat = GetChat(self.chats, chatId);
    let chat: Chat;
    if (userChat.isNone()) {
        chat = StartNewChat(self, chatId);
    } else {
        chat = userChat.unwrap();
    }
    try {
        const result = (await chat.sendMessage({ message: message })).text;
        const response = result ? Some(result) : None;
        return Ok(response);
    } catch (error) {
        return Err(error instanceof Error ? error : new Error("Unknown error calling Gemini API"));
    }
};

const GetChat = (chats: Map<string, Chat>, chatId: string): Option<Chat> => {
    return chats.has(chatId) ? Some(chats.get(chatId)!) : None;
}


// --------------------------------------------------------------------------------------------------------------------
/* 
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
 */