import { Recipe } from "./recipe";

export type Cookbook = {
    recipes: Recipe[];
};

const createCookbook = (): Cookbook => {
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

const getAllRecipes = (cookbook: Cookbook): Recipe[] => {
    return cookbook.recipes;
};