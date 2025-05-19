import { None, Option, Some } from "ts-results-es";
import { RecipeIngredient, Unit } from "./ingredient";
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

// ----- Recipe DTO ----- 
// DTO for BaseRecipe with optional fields instead of Option types
export type BaseRecipeDTO = {
    name: string;
    description?: string;
    ingredients: {
        type: string; // Changed from genericId to type
        quantity?: {
            amount: number;
            unit: string;
        };
    }[];
    instructions: string[];
    tags: {
        name: string;
        description?: string;
    }[];
}

// Transform BaseRecipeDTO to BaseRecipe
export function fromDTO(dto: BaseRecipeDTO): BaseRecipe {
    // Convert ingredients
    const ingredients: RecipeIngredient[] = dto.ingredients.map(ing => ({
        type: ing.type, // Changed from genericId to type
        quantity: ing.quantity ? Some({
            amount: ing.quantity.amount,
            unit: ing.quantity.unit as Unit
        }) : None
    }));

    // Convert tags
    const tags: Tag[] = dto.tags.map(tag => ({
        name: tag.name,
        description: tag.description ? Some(tag.description) : None
    }));

    // Create base recipe
    return createBaseRecipe(
        dto.name,
        dto.description,
        ingredients,
        dto.instructions,
        tags
    );
}