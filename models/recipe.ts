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
        genericId: string;
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
        genericId: ing.genericId,
        quantity: ing.quantity ? Some({
            amount: ing.quantity.amount, // Use amount from DTO but map to quantity for domain model
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

/* // Utility function to create a BaseRecipe from json data
export function fromJSON(data: any): BaseRecipe {
    // Validate required fields
    if (!data.name) {
        throw new Error('Recipe name is required');
    }

    // Process ingredients
    const ingredients = Array.isArray(data.ingredients) ? data.ingredients.map((ing: any) => ({
        genericId: ing.genericId,
        quantity: ing.quantity ? Some(ing.quantity) : None
    })) : [];

    // Process instructions
    const instructions = Array.isArray(data.instructions) ? data.instructions : [];

    // Process tags
    const tags = new Set<Tag>();
    if (Array.isArray(data.tags)) {
        data.tags.forEach((tag: any) => {
            if (tag && typeof tag === 'object' && tag.name) {
                tags.add({
                    name: tag.name,
                    description: tag.description ? Some(tag.description) : None
                });
            }
        });
    }

    return {
        name: data.name,
        description: data.description ? Some(data.description) : None,
        ingredients,
        instructions,
        tags
    };
} */