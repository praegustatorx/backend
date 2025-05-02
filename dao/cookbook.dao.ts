import { Option, Some, None, Result, Ok, Err } from 'ts-results-es';
import CookbookModel, { CookbookDocument } from '../database/cookbookSchema';
import RecipeModel from '../database/recipeSchema';
import { Cookbook, createCookbook as domainCookbookCreate } from '../models/cookbook';
import { BaseRecipe, Recipe } from '../models/recipe';
import recipeDAO from './recipe.dao';
import recipeDao from './recipe.dao';


// TODO:? Just generated
export type CookbookDAO = {
    createCookbook: (userId: string) => Promise<Result<void, Error>>;
    getCookbook: (userId: string) => Promise<Result<Cookbook, Error>>;
    createRecipe: (userId: string, recipe: BaseRecipe) => Promise<Result<void, Error>>;
    // TODO: Add recipe to cookbook with recipeId if recipes can be shared between cookbooks
    // addRecipe: (userId: string, recipeId: string) => Promise<Result<void, Error>>;
    removeRecipe: (userId: string, recipeId: string) => Promise<Result<void, Error>>;
    getRecipe: (userId: string, recipeId: string) => Promise<Result<Recipe, Error>>;
    searchRecipesByTag: (userId: string, tagName: string) => Promise<Result<Recipe[], Error>>;
};

export const createCookbookDAO = (): CookbookDAO => {
    const cookbookModel = CookbookModel;
    const recipeModel = RecipeModel;

    const createCookbook = async (userId: string): Promise<Result<void, Error>> => {
        try {
            cookbookModel.exists({ _id: userId }).then(async (exists) => {
                if (exists) {
                    return Err(new Error("A cookbook for this user already exists")); // Cookbook already exists
                }

                // Create new cookbook
                const newCookbook = await cookbookModel.create({
                    _id: userId,
                    recipes: []
                });

                // Cookbook created successfully
            })
            return Ok(undefined);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));

        }
    };

    const getCookbook = async (userId: string): Promise<Result<Cookbook, Error>> => {
        try {
            const cookbookDoc = await cookbookModel.findById(userId);
            if (!cookbookDoc) {
                return Err(new Error("Cookbook not found"));
            }

            // Fetch all recipes referenced in the cookbook
            const recipeIds = cookbookDoc.recipes.map(id => id.toString());
            const recipesResult = await recipeDAO.getRecipesByIds(recipeIds);

            return recipesResult.map(recipes => { return domainCookbookCreate(userId, recipes) });
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const createRecipe = async (userId: string, recipe: BaseRecipe): Promise<Result<void, Error>> => {
        try {

            const addedToCookbook = (await recipeDao.createRecipe(recipe)).map(async recipeId => {
                // Add the new recipe ID to the user's cookbook
                let b = cookbookModel.findByIdAndUpdate(
                    userId,
                    { $addToSet: { recipes: recipeId } },
                    { new: true }
                ).then((result) => { return result !== null; });
                return b;
            });

            if (addedToCookbook.isOk()) {
                return (await addedToCookbook.unwrap())
                    ? Ok(undefined)
                    : Err(new Error("Cookbook not found"));
            } else {
                return Err(new Error("Recipe creation failed"));
            }
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const removeRecipe = async (userId: string, recipeId: string): Promise<Result<void, Error>> => {
        try {
            // First check if the cookbook exists and if it contains the recipe
            const cookbook = await cookbookModel.findById(userId);
            if (!cookbook) {
                return Err(new Error("Cookbook not found"));
            }

            // Check if the recipe exists in the cookbook
            const hasRecipe = cookbook.recipes.some(id => id.toString() === recipeId);
            if (!hasRecipe) {
                return Err(new Error("Recipe not found in cookbook"));
            }

            // Remove the recipe from the cookbook
            await cookbookModel.findByIdAndUpdate(
                userId,
                { $pull: { recipes: recipeId } }
            );

            // Delete the recipe from the recipe collection
            const recipeResult = await recipeModel.findByIdAndDelete(recipeId);
            if (!recipeResult) {
                return Err(new Error("Recipe does not exist in database"));
            }

            return Ok(undefined);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const getRecipe = async (userId: string, recipeId: string): Promise<Result<Recipe, Error>> => {
        try {
            // First check if the cookbook exists and contains the recipe
            const cookbookDoc = await cookbookModel.findById(userId);
            if (!cookbookDoc) {
                return Err(new Error("Cookbook not found"));
            }

            if (!cookbookDoc.recipes.some(id => id.toString() === recipeId)) {
                return Err(new Error("Recipe not found in cookbook"));
            }

            // Then get the recipe details
            return recipeDAO.getRecipeById(recipeId);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const searchRecipesByTag = async (userId: string, tagName: string): Promise<Result<Recipe[], Error>> => {
        try {
            const cookbookResult = await getCookbook(userId);
            if (cookbookResult.isErr()) {
                return Err(cookbookResult.unwrapErr());
            }

            const cookbook = cookbookResult.unwrap();
            const recipes = cookbook.recipes.filter(recipe =>
                Array.from(recipe.tags).some(tag => tag.name.toLowerCase() === tagName.toLowerCase())
            );

            return Ok(recipes);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };


    return {
        createCookbook,
        getCookbook,
        createRecipe,
        removeRecipe,
        getRecipe,
        searchRecipesByTag
    };
};

export default createCookbookDAO();
