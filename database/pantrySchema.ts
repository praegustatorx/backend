import { Schema, Document, model } from 'mongoose';
import { Pantry, createPantry } from '../models/pantry';
import { CreatePantryIngredient, PantryIngredient, ExpDate, Unit, CreateMeasurement } from '../models/ingredient';
import { None, Option, Some } from 'ts-results-es';
import { createNutritions, NutrientUnit } from '../models/nutritional_information';
import { PantryIngredientSchema } from './ingredientsSchema';



// Interface for the Pantry document
export interface PantryDocument extends Document {
    userId: string;
    ingredients: {
        id: string;
        brand?: string;
        genericId: string;
        quantity?: {
            amount: number;
            unit: string;
        };
        nutrition: {
            portion: {
                amount: number;
                unit: string;
            };
            calories: [
                {
                    amount: number;
                    unit: string;
                },
                {
                    amount: number;
                    unit: string;
                }
            ];
            protein: {
                amount: number;
                unit: string;
            };
            fat: {
                amount: number;
                unit: string;
            };
            carbohydrates: {
                amount: number;
                unit: string;
            };
        };
        expiration_date?: Date;
    }[];
}

// Pantry Schema
const PantrySchema = new Schema({
    userId: { type: String, required: true, unique: true },
    ingredients: [PantryIngredientSchema]
});

const PantryModel = model<PantryDocument>('Pantry', PantrySchema);

export default PantryModel;

// Utility functions to convert between Mongoose model and domain model
export const toPantry = (doc: PantryDocument): Pantry => {
    const pantryIngredients: PantryIngredient[] = doc.ingredients.map(ingredient => {
        // Convert quantity if exists
        const quantityOption = ingredient.quantity
            ? Some(CreateMeasurement(
                ingredient.quantity.amount,
                ingredient.quantity.unit as Unit
            ))
            : None;

        // Convert expiration date if exists
        const expirationOption = ingredient.expiration_date
            ? Some(ingredient.expiration_date as ExpDate)
            : None;

        // Convert brand if exists
        const brandOption = ingredient.brand
            ? Some(ingredient.brand)
            : None;

        // Create nutrition
        // Cheking that calories has at least 2 elements
        const calories = ingredient.nutrition.calories.length > 1
            ? ingredient.nutrition.calories[1].amount
            : 0;

        const nutrition = createNutritions(
            {
                amount: ingredient.nutrition.portion.amount,
                unit: ingredient.nutrition.portion.unit as NutrientUnit
            },
            calories,
            ingredient.nutrition.protein.amount,
            ingredient.nutrition.fat.amount,
            ingredient.nutrition.carbohydrates.amount
        );

        return CreatePantryIngredient(
            ingredient.id,
            brandOption,
            ingredient.genericId,
            quantityOption,
            nutrition,
            expirationOption
        );
    });

    return createPantry(pantryIngredients);
};

export const fromPantry = (pantry: Pantry, userId: string): Partial<PantryDocument> => {
    const ingredientsArray = Array.from(pantry.ingredients.values()).map(ingredient => {
        return {
            id: ingredient.id,
            brand: ingredient.brand.isSome() ? ingredient.brand.unwrap() : undefined,
            genericId: ingredient.genericId,
            quantity: ingredient.quantity.isSome() ? {
                amount: ingredient.quantity.unwrap().amount, // Changed from 'quantity' to 'amount'
                unit: ingredient.quantity.unwrap().unit as string
            } : undefined,
            nutrition: {
                portion: {
                    amount: ingredient.nutrition.portion.amount,
                    unit: ingredient.nutrition.portion.unit as string
                },
                calories: [
                    {
                        amount: ingredient.nutrition.calories[0].amount,
                        unit: ingredient.nutrition.calories[0].unit as string
                    },
                    {
                        amount: ingredient.nutrition.calories[1].amount,
                        unit: ingredient.nutrition.calories[1].unit as string
                    }
                ] as [
                        { amount: number; unit: string },
                        { amount: number; unit: string }
                    ],
                protein: {
                    amount: ingredient.nutrition.protein.amount,
                    unit: ingredient.nutrition.protein.unit as string
                },
                fat: {
                    amount: ingredient.nutrition.fat.amount,
                    unit: ingredient.nutrition.fat.unit as string
                },
                carbohydrates: {
                    amount: ingredient.nutrition.carbohydrates.amount,
                    unit: ingredient.nutrition.carbohydrates.unit as string
                }
            },
            expiration_date: ingredient.expiration_date.isSome() ? ingredient.expiration_date.unwrap() : undefined
        };
    });

    return {
        userId,
        ingredients: ingredientsArray
    };
};
