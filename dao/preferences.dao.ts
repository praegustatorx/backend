import { Result, Ok, Err } from 'ts-results-es';
import PreferencesModel, { toPreferences, fromPreferences } from '../database/preferencesSchema';
import { Preferences, createPreferences as createDefaultDomainPreferences, Allergy, Diet } from '../models/preferences';
import { ClientSession, Types } from 'mongoose';
import { IngredientType } from '../models/ingredient'; // Assuming IngredientType is string

export type PreferencesDAO = {
    getPreferencesByUserId: (userId: string) => Promise<Result<Preferences, Error>>;
    createPreferences: (userId: string, session?: ClientSession) => Promise<Result<void, Error>>;
    updatePreferences: (userId: string, preferences: Partial<Preferences>) => Promise<Result<Preferences, Error>>;
    addAllergy: (userId: string, allergy: Allergy) => Promise<Result<void, Error>>;
    removeAllergy: (userId: string, allergy: Allergy) => Promise<Result<void, Error>>;
    addDiet: (userId: string, diet: Diet) => Promise<Result<void, Error>>;
    removeDietByName: (userId: string, dietName: string) => Promise<Result<void, Error>>;
    addToBlacklist: (userId: string, ingredient: IngredientType) => Promise<Result<void, Error>>;
    removeFromBlacklist: (userId: string, ingredientId: string) => Promise<Result<void, Error>>;
};

const preferencesDAO: PreferencesDAO = {
    async getPreferencesByUserId(userId: string): Promise<Result<Preferences, Error>> {
        try {
            const preferencesDoc = await PreferencesModel.findOne({ userId });
            if (!preferencesDoc) {
                return Err(new Error('Preferences not found for this user'));
            }
            return Ok(toPreferences(preferencesDoc));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    },

    async createPreferences(userId: string, session?: ClientSession): Promise<Result<void, Error>> {
        try {
            const existingPreferences = await PreferencesModel.findOne({ userId }).session(session || null);
            if (existingPreferences) {
                return Err(new Error('Preferences already exist for this user'));
            }
            const defaultPrefs = createDefaultDomainPreferences();
            const preferencesData = fromPreferences(defaultPrefs, userId);

            const createdDocs = await PreferencesModel.create([preferencesData], { session });
            if (!createdDocs || createdDocs.length === 0) {
                return Err(new Error('Failed to create preferences'));
            }
            return Ok(undefined);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    },

    async updatePreferences(userId: string, preferences: Partial<Preferences>): Promise<Result<Preferences, Error>> {
        try {
            // Construct the update payload, converting Sets to Arrays
            const updatePayload: {
                allergies?: { name: Allergy }[]; // Updated to reflect object structure
                diets?: Diet[];
                blacklist?: IngredientType[];
            } = {};

            if (preferences.allergies !== undefined) {
                // Map string allergies to objects { name: allergy_string }
                updatePayload.allergies = Array.from(preferences.allergies).map(a => ({ name: a }));
            }
            if (preferences.diets !== undefined) {
                updatePayload.diets = Array.from(preferences.diets);
            }
            if (preferences.blacklist !== undefined) {
                updatePayload.blacklist = Array.from(preferences.blacklist);
            }

            const updatedDoc = await PreferencesModel.findOneAndUpdate(
                { userId },
                { $set: updatePayload },
                { new: true, runValidators: true }
            );

            if (!updatedDoc) {
                return Err(new Error('Preferences not found or failed to update'));
            }
            return Ok(toPreferences(updatedDoc));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    },

    async addAllergy(userId: string, allergy: Allergy): Promise<Result<void, Error>> {
        try {
            // Assumes 'allergies' field in MongoDB stores an array of objects like { name: String }.
            const result = await PreferencesModel.updateOne(
                { userId },
                { $addToSet: { allergies: { name: allergy } } } // Wrap allergy in an object
            );
            if (result.matchedCount === 0) {
                return Err(new Error('Preferences not found for this user.'));
            }
            return Ok(undefined);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(`Failed to add allergy: ${String(error)}`));
        }
    },

    async removeAllergy(userId: string, allergy: Allergy): Promise<Result<void, Error>> {
        try {
            // Assumes 'allergies' field in MongoDB stores an array of objects like { name: String }.
            const result = await PreferencesModel.updateOne(
                { userId },
                { $pull: { allergies: { name: allergy } } } // Use object structure for pulling
            );
            if (result.matchedCount === 0) {
                return Err(new Error('Preferences not found for this user.'));
            }
            if (result.modifiedCount === 0) {
                return Err(new Error('Allergy not found in preferences.'));
            }
            return Ok(undefined);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(`Failed to remove allergy: ${String(error)}`));
        }
    },

    async addDiet(userId: string, diet: Diet): Promise<Result<void, Error>> {
        try {
            const result = await PreferencesModel.updateOne(
                { userId },
                { $addToSet: { diets: diet } } // Diet is an object, $addToSet works with objects
            );
            if (result.matchedCount === 0) {
                return Err(new Error('Preferences not found for this user.'));
            }
            return Ok(undefined);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(`Failed to add diet: ${String(error)}`));
        }
    },

    async removeDietByName(userId: string, dietName: string): Promise<Result<void, Error>> {
        try {
            const result = await PreferencesModel.updateOne(
                { userId },
                { $pull: { diets: { name: dietName } } }
            );
            if (result.matchedCount === 0) {
                return Err(new Error('Preferences not found for this user.'));
            }
            if (result.modifiedCount === 0) {
                return Err(new Error('Diet not found in preferences.'));
            }
            return Ok(undefined);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(`Failed to remove diet: ${String(error)}`));
        }
    },

    async addToBlacklist(userId: string, ingredient: IngredientType): Promise<Result<void, Error>> {
        try {
            const result = await PreferencesModel.updateOne(
                { userId },
                { $addToSet: { blacklist: ingredient } }
            );
            if (result.matchedCount === 0) {
                return Err(new Error('Preferences not found for this user.'));
            }
            return Ok(undefined);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(`Failed to add to blacklist: ${String(error)}`));
        }
    },

    async removeFromBlacklist(userId: string, ingredientId: string): Promise<Result<void, Error>> {
        try {
            const result = await PreferencesModel.updateOne(
                { userId },
                { $pull: { blacklist: ingredientId } }
            );
            if (result.matchedCount === 0) {
                return Err(new Error('Preferences not found for this user.'));
            }
            if (result.modifiedCount === 0) {
                return Err(new Error('Ingredient not found in blacklist.'));
            }
            return Ok(undefined);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(`Failed to remove from blacklist: ${String(error)}`));
        }
    }
};

export default preferencesDAO;