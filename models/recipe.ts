import { None, Option, Some } from "ts-results-es";
import { RecipeIngredient } from "./ingredient";
// TODO: Move RecipeIngredient here

// TODO: Add id verification
// TODO: Add cooking time, serving size, and dietary restrictions
// TODO: Add instructions abstraction if needed
export type Recipe = {
    id: string;
} & BaseRecipe;

export type BaseRecipe = {
    name: string;
    description: Option<string>;
    ingredients: RecipeIngredient[];
    instructions: string[];
    tags: Set<Tag>;
}

export function createBaseRecipe(
    name: string,
    description: string | undefined,
    ingredients: RecipeIngredient[],
    instructions: string[],
    tags: Tag[] | Set<Tag>
): BaseRecipe {
    return {
        name: name,
        description: description ? Some(description) : None,
        ingredients: ingredients,
        instructions: instructions,
        tags: tags instanceof Set ? tags : new Set(tags),
    };
}

// ----- Tags ----- 
// TODO: Add tag::id field if needed
export type Tag = {
    name: string;
    description: Option<string>;
}