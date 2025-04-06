import { Option } from "ts-results-es";
import { RecipeIngredient } from "./ingredient";
// TODO: Move RecipeIngredient here

// TODO: Add cooking time, serving size, and dietary restrictions
// TODO: Add insrtuctions abstraction if needed
export type Recipe = {
    name: string;
    description: Option<string>;
    ingredients: RecipeIngredient[];
    instructions: string[];
    tags: Tag[];
}

export const createRecipe = (
    name: string,
    description: Option<string>,
    ingredients: RecipeIngredient[],
    instructions: string[],
    tags: Tag[] = []
): Recipe => {
    return {
        name,
        description,
        ingredients,
        instructions,
        tags
    };
};

// ----- Tags ----- 
// TODO: Add tag::id field if needed
type Tag = {
    name: string;
    description: Option<string>;
}

export const createTag = (
    name: string,
    description: Option<string>
): Tag => {
    return {
        name,
        description
    };
};