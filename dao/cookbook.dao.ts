import recipeDAO from './recipe.dao';

import { Result, Ok, Err } from 'ts-results-es';
import CookbookModel from '../database/cookbookSchema';
import RecipeModel from '../database/recipeSchema';
import { Cookbook, createCookbook as domainCookbookCreate } from '../models/cookbook';
import { BaseRecipe, Recipe } from '../models/recipe';

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
            const exists = await cookbookModel.exists({ _id: userId });
            if (exists) {
                return Err(new Error("A cookbook for this user already exists"));
            }

            // Create new cookbook
            await cookbookModel.create({
                _id: userId,
                recipes: []
            });
            
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
            const recipeResult = await recipeDAO.createRecipe(recipe);
            
            if (recipeResult.isErr()) {
                return Err(recipeResult.error);
            }
            
            const recipeId = recipeResult.unwrap();
            const updatedCookbook = await cookbookModel.findByIdAndUpdate(
                userId,
                { $addToSet: { recipes: recipeId } },
                { new: true }
            );
            
            return updatedCookbook 
                ? Ok(undefined) 
                : Err(new Error("Cookbook not found"));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const removeRecipe = async (userId: string, recipeId: string): Promise<Result<void, Error>> => {
        const session = await cookbookModel.db.startSession();
        session.startTransaction();
        
        try {
            // First check if the cookbook exists and if it contains the recipe
            const cookbook = await cookbookModel.findById(userId).session(session);
            if (!cookbook) {
                await session.abortTransaction();
                session.endSession();
                return Err(new Error("Cookbook not found"));
            }

            // Check if the recipe exists in the cookbook
            const hasRecipe = cookbook.recipes.some(id => id.toString() === recipeId);
            if (!hasRecipe) {
                await session.abortTransaction();
                session.endSession();
                return Err(new Error("Recipe not found in cookbook"));
            }

            // Remove the recipe from the cookbook
            await cookbookModel.findByIdAndUpdate(
                userId,
                { $pull: { recipes: recipeId } }
            ).session(session);

            // Delete the recipe from the recipe collection
            const recipeResult = await recipeModel.findByIdAndDelete(recipeId).session(session);
            if (!recipeResult) {
                await session.abortTransaction();
                session.endSession();
                return Err(new Error("Recipe does not exist in database"));
            }

            await session.commitTransaction();
            session.endSession();
            return Ok(undefined);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
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
            return (await getCookbook(userId)).map(cookbook => {
                return cookbook.recipes.filter(recipe =>
                    Array.from(recipe.tags).some(tag => tag.name.toLowerCase() === tagName.toLowerCase())
                );
            });
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
