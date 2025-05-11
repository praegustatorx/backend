import { Result, Ok, Err } from 'ts-results-es';
import PantryModel, { toPantryDto } from '../database/pantrySchema';
import { PantryDTO } from '../models/pantry';
import {
    PantryIngredient,
    DbPantryIngredient, // Changed Quantity to Measurement
} from '../models/ingredient';
import { ClientSession, Types } from 'mongoose';
import { toPantryIngredientDoc } from '../database/ingredientsSchema';

export type PantryDAO = {
    getPantryByUserId: (userId: string) => Promise<Result<PantryDTO, Error>>;
    getExpiredIngredients: (userId: string, date: Date) => Promise<Result<PantryIngredient[], Error>>;
    createPantry: (userId: string, session: ClientSession) => Promise<Result<Types.ObjectId, Error>>;
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

    async createPantry(userId: string, session: ClientSession): Promise<Result<Types.ObjectId, Error>> {
        try {
            const existingPantry = await PantryModel.findOne({ userId }).session(session);
            if (existingPantry) {
                return Err(new Error('Pantry already exists for this user'));
            }

            const pantryData = {
                userId,
                ingredients: []
            };

            const createdPantries = await PantryModel.create([pantryData], { session });
            if (!createdPantries) {
                return Err(new Error('Failed to create pantry'));
            }

            return Ok(createdPantries[0]._id);
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
