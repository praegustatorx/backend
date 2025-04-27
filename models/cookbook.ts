import { containsTag, containsTagName, Recipe, Tag } from "./recipe";

export type Cookbook = {
    recipes: Recipe[];
};

export const createCookbook = (): Cookbook => {
    return {
        recipes: [],
    };
};

const addRecipe = (cookbook: Cookbook, recipe: Recipe): void => {
    cookbook.recipes.push(recipe);
};

const removeRecipe = (cookbook: Cookbook, recipe: Recipe): void => {
    cookbook.recipes = cookbook.recipes.filter((r) => r !== recipe);
};

const searchRecipesByName = (cookbook: Cookbook, name: string): Recipe[] => {
    return cookbook.recipes.filter((recipe) => recipe.name.toLowerCase().includes(name.toLowerCase()));
};

const searchRecipesByTag = (cookbook: Cookbook, tag: Tag): Recipe[] => {
    return cookbook.recipes.filter((recipe) => containsTag(recipe, tag));
}

// TODO? Search recipe only by tag name. No description required
const searchRecipesByTagName = (cookbook: Cookbook, tagName: string): Recipe[] => {
    return cookbook.recipes.filter((recipe) => containsTagName(recipe, tagName));
}


const getAllRecipes = (cookbook: Cookbook): Recipe[] => {
    return cookbook.recipes;
};

const isEmpty = (cookbook: Cookbook): boolean => {
    return cookbook.recipes.length === 0;
};
