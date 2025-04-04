import { Err, Ok, Result } from "ts-results-es";
import { CreateExpDate, ExpDate, isIngredientExpired, PantryIngredient } from "./ingredient";

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

/**
 * A generator function that yields expired ingredients from the pantry.
 * @param pantry The pantry to check for expired ingredients.
 * @param date The date to compare against. Defaults to the current date.
 * @returns An iterable iterator of expired PantryIngredient objects.
 */
export const getExpiredIngredients = function* (pantry: Pantry, date: ExpDate = CreateExpDate()): IterableIterator<PantryIngredient> {
    for (const ingredient of pantry.ingredients.values()) {
        if (isIngredientExpired(ingredient, date)) {
            yield ingredient;
        }
    }
};