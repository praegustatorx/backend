import { Option } from "ts-results-es";
import { RecipeIngredient } from "./ingredient";
// TODO: Move RecipeIngredient here

// TODO: Add cooking time, serving size, and dietary restrictions
// TODO: Add insrtuctions abstraction if needed
type Recipe = {
    name: string;
    description: Option<string>;
    ingredients: RecipeIngredient[];
    instructions: string[];
}

export const createRecipe = (
    name: string,
    description: Option<string>,
    ingredients: RecipeIngredient[],
    instructions: string[]
): Recipe => {
    return {
        name,
        description,
        ingredients,
        instructions
    };
};