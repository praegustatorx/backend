import { Recipe, Tag } from "./recipe";

export type Cookbook = {
    userid: string;
    recipes: Recipe[];
};

export const createCookbook = (userid: string, recipes: Recipe[] = []): Cookbook => {
    return {
        userid,
        recipes,
    };
};

/* const addRecipe = (cookbook: Cookbook, recipe: CreationRecipeDTO): void => {
    cookbook.recipes.push(recipe);
};

const removeRecipe = (cookbook: Cookbook, recipe: CreationRecipeDTO): void => {
    cookbook.recipes = cookbook.recipes.filter((r) => r !== recipe);
};


// TODO? Search recipe only by tag name. No description required
const searchRecipesByTagName = (cookbook: Cookbook, tagName: string): CreationRecipeDTO[] => {
    return cookbook.recipes.filter((recipe) => containsTagName(recipe, tagName));
}

// TODO: Add retrieving all recipes from the cookbook
 */