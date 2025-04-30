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

// ----- Tags ----- 
// TODO: Add tag::id field if needed
export type Tag = {
    name: string;
    description: Option<string>;
}