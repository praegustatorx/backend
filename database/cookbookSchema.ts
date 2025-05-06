import { Schema, Document, model, Types } from 'mongoose';
import { Cookbook, createCookbook } from '../models/cookbook';
import RecipeModel, { toRecipe } from './recipeSchema';
import { Recipe } from '../models/recipe';

// Interface for Cookbook document
export interface CookbookDocument extends Document {
    userId: string;
    recipes: Types.ObjectId[];
}

// Cookbook Schema
const CookbookSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    recipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }]
});

const CookbookModel = model<CookbookDocument>('Cookbook', CookbookSchema);

export default CookbookModel;

// Utility functions to convert between Mongoose document and domain model
/* export const toCookbook = async (doc: CookbookDocument): Promise<Cookbook> => {
    // Fetch all recipes referenced in the cookbook
    const recipeDocuments = await RecipeModel.find({
        _id: { $in: doc.recipes }
    });

    // Convert each recipe document to domain model
    const recipes: Recipe[] = recipeDocuments.map(recipeDoc => toRecipe(recipeDoc));

    return {
        recipes
    };
}; */
