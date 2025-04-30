import { Schema, Document, model, Types } from 'mongoose';
import { Recipe, Tag } from '../models/recipe';
import { None, Some } from 'ts-results-es';
import { RecipeIngredient, Unit } from '../models/ingredient';

// Schema for Tag
const TagSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: false }
}, { _id: false });

// Schema for RecipeIngredient
const RecipeIngredientSchema = new Schema({
    genericId: { type: String, required: true },
    quantity: {
        quantity: { type: Number, required: false },
        unit: { type: String, required: false }
    }
}, { _id: false });

// Interface for Recipe document
export interface RecipeDocument extends Document {
    name: string;
    description?: string;
    ingredients: {
        genericId: string;
        quantity?: {
            quantity: number;
            unit: string;
        };
    }[];
    instructions: string[];
    tags: {
        name: string;
        description?: string;
    }[];
}

// Recipe Schema
const RecipeSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    ingredients: [RecipeIngredientSchema],
    instructions: [{ type: String, required: true }],
    tags: [TagSchema]
});

const RecipeModel = model<RecipeDocument>('Recipe', RecipeSchema);

export default RecipeModel;

// Utility functions to convert between Mongoose document and domain model
export const toRecipe = (doc: RecipeDocument): Recipe => {
    // Convert ingredients
    const ingredients: RecipeIngredient[] = doc.ingredients.map(ingredient => ({
        genericId: ingredient.genericId,
        quantity: ingredient.quantity ? Some({
            quantity: ingredient.quantity.quantity,
            unit: ingredient.quantity.unit as Unit as Unit
        }) : None
    }));

    // Convert tags
    const tags = new Set<Tag>();
    doc.tags.forEach(tag => {
        tags.add({
            name: tag.name,
            description: tag.description ? Some(tag.description) : None
        });
    });

    return {
        name: doc.name,
        description: doc.description ? Some(doc.description) : None,
        ingredients,
        instructions: doc.instructions,
        tags
    };
};

export const fromRecipe = (recipe: Recipe): Partial<RecipeDocument> => {
    return {
        name: recipe.name,
        description: recipe.description.isSome() ? recipe.description.unwrap() : undefined,
        ingredients: recipe.ingredients.map(ingredient => ({
            genericId: ingredient.genericId,
            quantity: ingredient.quantity.isSome() ? {
                quantity: ingredient.quantity.unwrap().quantity,
                unit: ingredient.quantity.unwrap().unit
            } : undefined
        })),
        instructions: recipe.instructions,
        tags: Array.from(recipe.tags).map(tag => ({
            name: tag.name,
            description: tag.description.isSome() ? tag.description.unwrap() : undefined
        }))
    };
};
