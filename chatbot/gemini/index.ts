import { Chat, GenerateContentResponse, GoogleGenAI } from '@google/genai';
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

const model = CreateGemini(process.env.GEMINI_API_KEY!);

// TODO: the model should be an input parameter
const GetChat = (chatId: string): Chat => {
    let chat: Chat;
    if (model.chats.has(chatId)) {
        chat = model.chats.get(chatId)!;
    } else {
        chat = model.genai.chats.create({ model: 'gemini-2.0-flash-001' });
        model.chats.set(chatId, chat);
    }
    return chat;
}

export const AskGemini = async (chatId: string, message: string): Promise<Result<Option<string>, Error>> => {
    const chat = GetChat(chatId);
    try {
        const result = (await chat.sendMessage({ message: message })).text;
        const response = result ? Some(result) : None;
        return Ok(response);
    } catch (error) {
        return Err(error instanceof Error ? error : new Error("Unknown error calling Gemini API"));
    }
};

export const AskGeminiStream = async (chatId: string, message: string): Promise<Result<AsyncGenerator<GenerateContentResponse>, Error>> => {
    const chat = GetChat(chatId);
    try {
        const stream = await chat.sendMessageStream({ message: message });
        return stream ? Ok(stream) : Err(new Error("Stream is undefined"));
    } catch (error) {
        return Err(error instanceof Error ? error : new Error("Unknown error calling Gemini API"));
    }
};