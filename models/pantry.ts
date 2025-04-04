import { Err, Ok, Result } from "ts-results-es";
import { PantryIngredient } from "./ingredient";

export type Pantry = {
    ingredients: Map<string, PantryIngredient>;
}

export const createPantry = (ingredients: PantryIngredient[] = []): Pantry => {
    const ingredientsMap = new Map<string, PantryIngredient>();
    ingredients.forEach(ingredient => {
        ingredientsMap.set(ingredient.id, ingredient);
    });
    return { ingredients: ingredientsMap };
};

export const addIngredient = (pantry: Pantry, ingredient: PantryIngredient): void => {
    pantry.ingredients.set(ingredient.id, ingredient);
};

export const removeIngredient = (pantry: Pantry, ingredientId: string): Result<void, void> => {
    return pantry.ingredients.delete(ingredientId) ? Ok(undefined) : Err(undefined);
};