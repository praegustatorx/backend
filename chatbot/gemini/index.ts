import { Chat, CreateChatParameters, GenerateContentConfig, GenerateContentResponse, GoogleGenAI, PartUnion } from '@google/genai';
import { Result, Ok, Err, Some } from 'ts-results-es';
import { PantryIngredient } from '../../models/ingredient';
import { createNutrition } from '../../models/nutritional_information';
import { ChatResponse } from '../../models/chat';
import { BaseRecipe } from '../../models/recipe';
import preferencesDAO from '../../dao/preferences.dao';
import { preferencesIntoDTO } from '../../models/preferences';
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
let config: GenerateContentConfig = {
    responseMimeType: "text/plain",
    systemInstruction: process.env.SYSTEM_INSTRUCTIONS ? [process.env.SYSTEM_INSTRUCTIONS] : [],
    temperature: 0.8,
}
let parameters: CreateChatParameters = { model: model_name, config };

const user_date = async (user_id: string): Promise<string> => {
    const preferences = await preferencesDAO.getPreferencesByUserId(user_id);
    return preferences.isOk() ? JSON.stringify(preferencesIntoDTO(preferences.unwrap())) : "";

}


// TODO: the model should be an input parameter
const GetChat = async (chatId: string): Promise<Chat> => {
    let chat: Chat;
    if (ai.chats.has(chatId)) {
        chat = ai.chats.get(chatId)!;
    } else {
        let params = structuredClone(parameters);
        if (params.config) {
            const userPreferences = await user_date(chatId);
            (params.config.systemInstruction as PartUnion[]).push(userPreferences);
        }
        // const params = parameters.config?.systemInstruction;
        chat = ai.genai.chats.create(params);

        ai.chats.set(chatId, chat);
    }
    return chat;
}

export const AskGemini = async (chatId: string, message: string): Promise<Result<ChatResponse, Error>> => {
    const chat = await GetChat(chatId);

    try {
        let result = (await chat.sendMessage({ message: message })).text;

        if (!result) return Err(new Error("No result from Gemini API"));

        let value: ChatResponse;
        // Extract JSON content between ```json and ``` if present
        if (result.startsWith("```json")) {
            const startIdx = result.indexOf("```json") + 7;
            const endIdx = result.indexOf("```", startIdx);
            if (endIdx > startIdx) {
                result = result.substring(startIdx, endIdx).trim();
            } else {
                result = result.substring(startIdx).trim();
            }
            const recipes: BaseRecipe[] = JSON.parse(result);
            value = recipes;
            // console.log("Parsed recipes: ", recipes, "----");
        } else {
            value = result;
        }
        return Ok(value);
    } catch (error) {
        return Err(error instanceof Error ? error : new Error("Unknown error calling Gemini API"));
    }
};

export const AskGeminiStream = async (chatId: string, message: string): Promise<Result<AsyncGenerator<GenerateContentResponse>, Error>> => {
    const chat = await GetChat(chatId);
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
