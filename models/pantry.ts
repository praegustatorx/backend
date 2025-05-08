import { DbPantryIngredient } from "./ingredient";

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


