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