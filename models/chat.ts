import { BaseRecipe } from "./recipe";

export type ChatMessage = {
    role: "user" | "model";
    content: string;
}

export type ChatResponse = string | BaseRecipe[];
