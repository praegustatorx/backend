import { Result, Ok, Err, Option } from 'ts-results-es';
import PantryModel, { PantryDocument, toPantryDto } from '../database/pantrySchema';
import { PantryDTO } from '../models/pantry';
import {
    PantryIngredient,
    Measurement,
    DbPantryIngredient, // Changed Quantity to Measurement
} from '../models/ingredient';
import {
    Nutrition,
    NutrientAmount // Imported NutrientAmount to reference its structure if needed, though not directly used in map
} from '../models/nutritional_information';
import {
    toPantryIngredientDoc
} from "../database/ingredientsSchema";

const mapDomainIngredientToSchemaData = (ingredient: PantryIngredient): any => {
    const nutritionData = ingredient.nutrition.isSome() ? {
        calories: ingredient.nutrition.unwrap().calories, // calories is NutrientAmount
        protein: ingredient.nutrition.unwrap().protein,   // protein is NutrientAmount
        carbohydrates: ingredient.nutrition.unwrap().carbohydrates, // carbohydrates is NutrientAmount
        fat: ingredient.nutrition.unwrap().fat, // fat is NutrientAmount
        portion: ingredient.nutrition.unwrap().portion // portion is NutrientAmount
    } : undefined;

    return {
        type: ingredient.type,
        brand: ingredient.brand.isSome() ? ingredient.brand.unwrap() : undefined,
        quantity: ingredient.quantity.isSome() ? ingredient.quantity.unwrap() : undefined,
        nutrition: nutritionData,
        expiration_date: ingredient.expiration_date.isSome() ? ingredient.expiration_date.unwrap() : undefined,
    };
};

export type PantryDAO = {
    getPantryByUserId: (userId: string) => Promise<Result<PantryDTO, Error>>;
    getExpiredIngredients: (userId: string, date: Date) => Promise<Result<PantryIngredient[], Error>>;
    createPantry: (userId: string) => Promise<Result<PantryDTO, Error>>;
    addIngredientToPantry: (userId: string, ingredient: Partial<PantryIngredient>) => Promise<Result<PantryDTO, Error>>;
    removeIngredientFromPantry: (userId: string, ingredientId: string) => Promise<Result<void, Error>>;
};

const pantryDAO: PantryDAO = {
    async getPantryByUserId(userId: string): Promise<Result<PantryDTO, Error>> {
        try {
            const pantryDoc = await PantryModel.findOne({ userId });
            if (!pantryDoc) {
                return Err(new Error('Pantry not found'));
            }
            return Ok(toPantryDto(pantryDoc));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    },

    async getExpiredIngredients(userId: string, date: Date): Promise<Result<PantryIngredient[], Error>> {
        try {
            const pantryDoc = await PantryModel.findOne({ userId });
            if (!pantryDoc) {
                return Err(new Error('Pantry not found'));
            }
            const pantryDto = toPantryDto(pantryDoc);
            const expired = pantryDto.ingredients.filter(ing =>
                ing.expiration_date.isSome() &&
                ing.expiration_date.unwrap() <= date
            );
            return Ok(expired);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    },

    async createPantry(userId: string): Promise<Result<PantryDTO, Error>> {
        try {
            const existingPantry = await PantryModel.findOne({ userId });
            if (existingPantry) {
                return Err(new Error('Pantry already exists for this user'));
            }

            const pantryData = {
                userId,
                ingredients: []
            };

            const result = await PantryModel.create(pantryData);
            return Ok(toPantryDto(result));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    },

    async addIngredientToPantry(userId: string, ingredient: Partial<PantryIngredient>): Promise<Result<PantryDTO, Error>> {
        try {
            // Cast to Partial<DbPantryIngredient> is safe as DbPantryIngredient is PantryIngredient + optional id
            const mappedIngredient = toPantryIngredientDoc(ingredient as Partial<DbPantryIngredient>);

            const updatedDoc = await PantryModel.findOneAndUpdate(
                { userId },
                { $push: { ingredients: mappedIngredient } },
                { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
            );

            if (!updatedDoc) {
                return Err(new Error('Failed to add ingredient or create pantry'));
            }
            return Ok(toPantryDto(updatedDoc));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    },

    async removeIngredientFromPantry(userId: string, ingredientId: string): Promise<Result<void, Error>> {
        try {
            const pantryExists = await PantryModel.exists({ userId });
            if (!pantryExists) {
                return Err(new Error('Pantry not found'));
            }

            const updateResult = await PantryModel.updateOne(
                { userId },
                { $pull: { ingredients: { _id: ingredientId } } }
            );

            if (updateResult.modifiedCount === 0) {
                // Check if the ingredient actually existed with that _id before the pull attempt
                const pantryDoc = await PantryModel.findOne({
                    userId,
                    "ingredients._id": ingredientId
                });
                if (!pantryDoc) {
                    // If pantryDoc is null, it means no ingredient with that _id was found
                    return Err(new Error('Ingredient not found in pantry with the provided ID'));
                }
                // If pantryDoc is found, but modifiedCount is 0, it's an unusual state.
                // This could happen if the ingredientId was valid but for some reason $pull didn't remove it.
                // However, typically, if $elemMatch (or direct _id check) finds it, $pull should remove it.
                return Err(new Error('Ingredient found but not removed, possible data inconsistency or concurrent modification.'));
            }
            return Ok(undefined);
        } catch (error) {
            // Handle potential CastError if ingredientId is not a valid ObjectId format
            if (error instanceof Error && error.name === 'CastError') {
                return Err(new Error('Invalid ingredient ID format'));
            }
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    }
};

export default pantryDAO;
