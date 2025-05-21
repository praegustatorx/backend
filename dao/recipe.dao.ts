import { Result, Ok, Err } from 'ts-results-es';
import RecipeModel, { toRecipe, fromTag, fromRecipe } from '../database/recipeSchema';
import { ClientSession } from 'mongoose';
import { BaseRecipe, Recipe, Tag } from '../models/recipe';

export type RecipeDAO = {
    createRecipe: (recipe: BaseRecipe, session?: ClientSession) => Promise<Result<Recipe, Error>>;
    // TODO create an id type, which gets validated on receive
    getRecipeById: (id: string) => Promise<Result<Recipe, Error>>;
    getRecipesByIds: (ids: string[]) => Promise<Result<Recipe[], Error>>;
    // TODO: Use a partial type for recipe to allow partial updates directly from endpoint
    updateRecipe: (recipe: Recipe) => Promise<Result<Recipe, Error>>;
    deleteRecipe: (id: string) => Promise<Result<boolean, Error>>;
    addTag: (id: string, tag: Tag) => Promise<Result<Recipe, Error>>;
    removeTag: (id: string, tagName: string) => Promise<Result<Recipe, Error>>;
    updateDescription: (id: string, description: string) => Promise<Result<Recipe, Error>>;
};

export const createRecipeDAO = (): RecipeDAO => {
    const recipeModel = RecipeModel;

    const createRecipe = async (recipe: BaseRecipe, session?: ClientSession): Promise<Result<Recipe, Error>> => {
        try {
            const recipeData = fromRecipe(recipe);
            let createdRecipe;

            if (session) {
                // Use the session for transaction if provided
                const docs = await recipeModel.create([recipeData], { session });
                createdRecipe = docs[0];
            } else {
                // Execute without a session (standard operation)
                createdRecipe = await recipeModel.create(recipeData);
            }

            return Ok(toRecipe(createdRecipe));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const getRecipeById = async (id: string): Promise<Result<Recipe, Error>> => {
        try {
            const recipe = await recipeModel.findById(id);
            if (!recipe) return Err(new Error("Recipe not found"));
            return Ok(toRecipe(recipe));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    // TODO: make it a generator function
    const getRecipesByIds = async (ids: string[]): Promise<Result<Recipe[], Error>> => {
        try {
            if (ids && ids.length > 0) {
                // Find only recipes with IDs in the provided array
                const recipes = await recipeModel.find({
                    _id: { $in: ids }
                });
                return Ok(recipes.map(recipe => toRecipe(recipe)));
            }
            return Ok([]); // Return an empty array if no IDs are provided
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const updateRecipe = async (recipe: Recipe): Promise<Result<Recipe, Error>> => {
        try {
            const id = recipe.id;
            const recipeData = fromRecipe(recipe);
            const updatedRecipe = await recipeModel.findByIdAndUpdate(
                id,
                recipeData,
                { new: true }
            );
            if (!updatedRecipe) return Err(new Error("Recipe not found"));
            return Ok(toRecipe(updatedRecipe));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const deleteRecipe = async (id: string): Promise<Result<boolean, Error>> => {
        try {
            const result = await recipeModel.findByIdAndDelete(id);
            return Ok(result !== null);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const addTag = async (id: string, tag: Tag): Promise<Result<Recipe, Error>> => {
        try {
            const tagData = fromTag(tag);
            const updatedRecipe = await recipeModel.findByIdAndUpdate(
                id,
                { $addToSet: { tags: tagData } },
                { new: true }
            );

            if (!updatedRecipe) return Err(new Error("Recipe not found"));

            return Ok(toRecipe(updatedRecipe));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const removeTag = async (id: string, tagName: string): Promise<Result<Recipe, Error>> => {
        try {
            const updatedRecipe = await recipeModel.findByIdAndUpdate(
                id,
                { $pull: { tags: { name: tagName } } },
                { new: true }
            );

            if (!updatedRecipe) return Err(new Error("Recipe not found"));

            return Ok(toRecipe(updatedRecipe));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const updateDescription = async (id: string, description: string): Promise<Result<Recipe, Error>> => {
        try {
            const updatedRecipe = await recipeModel.findByIdAndUpdate(
                id,
                { description: description.length > 0 ? description : undefined },
                { new: true }
            );

            return updatedRecipe ? Ok(toRecipe(updatedRecipe)) : Err(new Error("Recipe not found"));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    };

    return {
        createRecipe,
        getRecipeById,
        getRecipesByIds,
        updateRecipe,
        deleteRecipe,
        addTag,
        removeTag,
        updateDescription
    };
};

export default createRecipeDAO();
