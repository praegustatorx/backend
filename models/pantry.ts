import { DbPantryIngredient } from "./ingredient";

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


