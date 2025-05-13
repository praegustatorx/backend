import { Chat, GenerateContentResponse, GoogleGenAI } from '@google/genai';
import { Result, Ok, Err, Option, Some, None } from 'ts-results-es';
import { PantryIngredient } from '../../models/ingredient';
import { createNutrition } from '../../models/nutritional_information';
import { raw } from 'express';
// import { BaseChatbot } from '..';

export type Gemini = {
    genai: GoogleGenAI;
    chats: Map<string, Chat>;
}


export const CreateGemini = (apiKey: string): Gemini => {
    const genai = new GoogleGenAI({ apiKey });
    const chats_cache = new Map<string, Chat>();

    return { genai, chats: chats_cache };
}

const ai = CreateGemini(process.env.GEMINI_API_KEY!);
const model_name = 'gemini-2.0-flash';

// TODO: the model should be an input parameter
const GetChat = (chatId: string): Chat => {
    let chat: Chat;
    if (ai.chats.has(chatId)) {
        chat = ai.chats.get(chatId)!;
    } else {
        chat = ai.genai.chats.create({ model: model_name });
        ai.chats.set(chatId, chat);
    }
    return chat;
}

export const AskGemini = async (chatId: string, message: string): Promise<Result<Option<string>, Error>> => {
    const chat = GetChat(chatId);
    try {
        const result = (await chat.sendMessage({ message: message })).text;
        const response = result ? Some(result) : None;
        /* chat.getHistory().forEach((message) => {
            let content;
            if (message.parts) {
                content = message.parts.map((part) => part.text).join(' \/ ');
            }
            let role = message.role;
            console.warn(`Role: ${role}, Content: ${content}`);
        }
        ); */
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

export type GeneratedNutrientInfo = Omit<PantryIngredient, "brand" | "quantity" | "expiration_date">;
export const FetchNutrientInfo = async (ingredient: string): Promise<Result<GeneratedNutrientInfo, Error>> => {
    try {
        const result = (await ai.genai.models.generateContent({
            model: model_name,
            contents: ingredient,
            config: {
                systemInstruction: "Provide a nutritional information about the ingredient provided. Include the following fields in numbers per 100 grams: calories, protein, fat, carbohydrates. The structure should be: {\"calories\": c, \"protein\": p, \"fat\": f, \"carbohydrates\": k} If the ingredient is not found, return an empty JSON object {}.",
            },
        })).text;

        if (!result) return Err(new Error("No result from Gemini API"));

        const raw_nutrients = JSON.parse(result);
        if (Object.keys(raw_nutrients).length === 0) return Err(new Error("No nutritional information found"));

        const nutrients = createNutrition(undefined, raw_nutrients.calories, raw_nutrients.protein, raw_nutrients.fat, raw_nutrients.carbohydrates);
        const generatedNutrientInfo: GeneratedNutrientInfo = {
            type: ingredient,
            nutrition: Some(nutrients),
        };

        return Ok(generatedNutrientInfo);
    } catch (error) {
        console.error("Error fetching nutrient info:", error);
        return Err(error instanceof Error ? error : new Error("Unknown error fetching nutrient info"));
    }

}
