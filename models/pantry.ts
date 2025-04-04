import { PantryIngredient } from "./ingredient";

export type Pantry = {
    ingredients: PantryIngredient[];
}

export const createPantry = (ingredients: PantryIngredient[] = []): Pantry => {
    return { ingredients };
};

export const addIngredient = (pantry: Pantry, ingredient: PantryIngredient): void => {
    pantry.ingredients.push(ingredient);
};

export const removeIngredient = (pantry: Pantry, ingredientId: string): void => {
    pantry.ingredients = pantry.ingredients.filter(ingredient => ingredient.id !== ingredientId);
};