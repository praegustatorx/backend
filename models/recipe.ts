import { None, Option, Some } from "ts-results-es";
import { RecipeIngredient } from "./ingredient";
// TODO: Move RecipeIngredient here

// TODO: Add cooking time, serving size, and dietary restrictions
// TODO: Add instructions abstraction if needed
export type Recipe = {
    name: string;
    description: Option<string>;
    ingredients: RecipeIngredient[];
    instructions: string[];
    tags: Set<Tag>;
}

const createRecipe = (
    name: string,
    description: Option<string>,
    ingredients: RecipeIngredient[],
    instructions: string[],
    tags: Tag[] | Set<Tag> = []
): Recipe => {
    return {
        name,
        description,
        ingredients,
        instructions,
        tags: tags instanceof Set ? tags : new Set(tags)
    };
};

const addDescription = (recipe: Recipe, description: string) => {
    let tmp: Option<string>;
    if (description.length == 0) {
        tmp = None;
    } else {
        tmp = Some(description)
    }

    recipe.description = tmp;
}

const removeDescription = (recipe: Recipe) => { addDescription(recipe, "") }

const addTag = (recipe: Recipe, tag: Tag) => {
    recipe.tags.add(tag);
}

const removeTag = (recipe: Recipe, tagName: string) => {
    for (const tag of recipe.tags) {
        if (tag.name === tagName) {
            recipe.tags.delete(tag);
            break;
        }
    }
}

export const containsTag = (recipe: Recipe, tag: Tag): boolean => {
    return recipe.tags.has(tag);
}

export const containsTagName = (recipe: Recipe, tagName: string): boolean => {
    return Array.from(recipe.tags).some(tag => tag.name === tagName);
}

// ----- Tags ----- 
// TODO: Add tag::id field if needed
export type Tag = {
    name: string;
    description: Option<string>;
}

const createTag = (
    name: string,
    description: Option<string>
): Tag => {
    return {
        name,
        description
    };
};