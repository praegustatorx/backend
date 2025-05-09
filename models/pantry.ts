import { DbPantryIngredient, PantryIngredient, ExpDate } from "./ingredient";
import { Result, Ok, Err } from "ts-results-es";

// Original DTO, keeping it for now in case it's used elsewhere or for a different purpose.
export type PantryDTO = {
    userId: string;
    ingredients: DbPantryIngredient[];
}

export const createPantryDto = (userId: string, ingredients: DbPantryIngredient[]): PantryDTO => {
    return {
        userId,
        ingredients
    };
};


