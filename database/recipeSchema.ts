import { Schema, Document, model, Types } from 'mongoose';
import { Tag, BaseRecipe, Recipe, createBaseRecipe } from '../models/recipe';
import { None, Some } from 'ts-results-es';
import { RecipeIngredient, Unit } from '../models/ingredient';

// Schema for Tag
const TagSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: false }
}, { _id: false });

// Tag conversion utilities
export const fromTag = (tag: Tag): { name: string; description?: string } => {
    return {
        name: tag.name,
        description: tag.description.isSome() ? tag.description.unwrap() : undefined
    };
};

export const toTag = (schemaTag: { name: string; description?: string }): Tag => {
    return {
        name: schemaTag.name,
        description: schemaTag.description ? Some(schemaTag.description) : None
    };
};

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
    _id: Types.ObjectId; // Explicitly define the _id field
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
            unit: ingredient.quantity.unit as Unit
        }) : None
    }));

    // Convert tags using the existing toTag function
    const tags = new Set<Tag>();
    doc.tags.forEach(tag => {
        tags.add({
            name: tag.name,
            description: tag.description ? Some(tag.description) : None
        });
    });

    // Create base recipe
    const baseRecipe = createBaseRecipe(
        doc.name,
        doc.description,
        ingredients,
        doc.instructions,
        tags
    );

    // Return full recipe with id
    return {
        id: doc._id.toString(), // Convert ObjectId to string
        ...baseRecipe
    };
};

// Convert domain Recipe model to database format
export const fromRecipe = (recipe: Recipe | BaseRecipe): Partial<RecipeDocument> => {
    // Convert ingredients
    const ingredients = recipe.ingredients.map(ingredient => ({
        genericId: ingredient.genericId,
        quantity: ingredient.quantity.isSome() ? {
            quantity: ingredient.quantity.unwrap().quantity,
            unit: ingredient.quantity.unwrap().unit
        } : undefined
    }));

    // Convert tags using the existing fromTag function
    const tags = Array.from(recipe.tags).map(tag => fromTag(tag));

    // Return partial document (without _id as MongoDB will handle that)
    return {
        name: recipe.name,
        description: recipe.description.isSome() ? recipe.description.unwrap() : undefined,
        ingredients,
        instructions: recipe.instructions,
        tags
    };
};


