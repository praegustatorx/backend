import recipeDAO from './recipe.dao';
import mongoose, { ClientSession, Types } from 'mongoose';

import { Result, Ok, Err } from 'ts-results-es';
import CookbookModel from '../database/cookbookSchema';
import RecipeModel from '../database/recipeSchema';
import { Cookbook, createCookbook as domainCookbookCreate } from '../models/cookbook';
import { BaseRecipe, Recipe } from '../models/recipe';

export type CookbookDAO = {
    createCookbook: (userId: string,  session: ClientSession) => Promise<Result<void, Error>>;
    getCookbook: (userId: string) => Promise<Result<Cookbook, Error>>;
    createRecipe: (userId: string, recipe: BaseRecipe) => Promise<Result<Recipe, Error>>;
    removeRecipe: (userId: string, recipeId: string) => Promise<Result<void, Error>>;
    getRecipe: (userId: string, recipeId: string) => Promise<Result<Recipe, Error>>;
    searchRecipesByTag: (userId: string, tagName: string) => Promise<Result<Recipe[], Error>>;
};

export const createCookbookDAO = (): CookbookDAO => {
    const cookbookModel = CookbookModel;
    const recipeModel = RecipeModel;

    /**
     * Creates a new cookbook for a user
     * @param userId - The ID of the user to create a cookbook for
     * @returns A Result containing either the created Cookbook or an Error
     */
    const createCookbook = async (userId: string, session: ClientSession): Promise<Result<void, Error>> => {
       /*  const session = await cookbookModel.db.startSession();
        session.startTransaction(); */

        try {
            const exists = await cookbookModel.exists({ userId: userId }).session(session);
            if (exists) {
                return Err(new Error("A cookbook for this user already exists"));
            }

            // Create new cookbook directly in the database
            const cookbook = await cookbookModel.create([{
                userId: userId,
                recipes: []
            }], { session });

            return Ok(undefined);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const getCookbook = async (userId: string): Promise<Result<Cookbook, Error>> => {
        try {
            // Fix: findOne instead of findById with object query
            const cookbookDoc = await cookbookModel.findOne({ userId: userId });
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

    const createRecipe = async (userId: string, recipe: BaseRecipe): Promise<Result<Recipe, Error>> => {
        const session = await cookbookModel.db.startSession();
        session.startTransaction();

        try {
            // Fix: findOne instead of findById with object query
            const cookbook = await cookbookModel.findOne({ userId: userId }).session(session);
            if (!cookbook) {
                await session.abortTransaction();
                session.endSession();
                return Err(new Error("Cookbook not found"));
            }

            // Create the recipe
            const creatingRecipe = await recipeDAO.createRecipe(recipe, session);

            if (creatingRecipe.isErr()) {
                await session.abortTransaction();
                session.endSession();
                return Err(creatingRecipe.error);
            }

            const createdRecipe = creatingRecipe.unwrap();

            // Update the cookbook with the new recipe
            await cookbookModel.findOneAndUpdate(
                { userId: userId },
                { $addToSet: { recipes: createdRecipe.id } }
            ).session(session);

            await session.commitTransaction();
            session.endSession();
            return Ok(createdRecipe);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const removeRecipe = async (userId: string, recipeId: string): Promise<Result<void, Error>> => {
        const session = await cookbookModel.db.startSession();
        session.startTransaction();

        try {
            // Fix: findOne instead of findById
            const cookbook = await cookbookModel.findOne({ userId: userId }).session(session);
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
            await cookbookModel.findOneAndUpdate(
                { userId: userId },
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
            // Fix: findOne instead of findById
            const cookbookDoc = await cookbookModel.findOne({ userId: userId });
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
