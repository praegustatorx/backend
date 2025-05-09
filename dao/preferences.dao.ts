import { Result, Ok, Err } from 'ts-results-es';
import PreferencesModel, { toPreferences, fromPreferences, PreferencesDocument } from '../database/preferencesSchema';
import { Preferences, createPreferences as createDefaultDomainPreferences } from '../models/preferences';
import { ClientSession, Types } from 'mongoose';

export type PreferencesDAO = {
    getPreferencesByUserId: (userId: string) => Promise<Result<Preferences, Error>>;
    createPreferences: (userId: string, session?: ClientSession) => Promise<Result<Types.ObjectId, Error>>;
    updatePreferences: (userId: string, preferences: Preferences) => Promise<Result<Preferences, Error>>;
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

    async createPreferences(userId: string, session?: ClientSession): Promise<Result<Types.ObjectId, Error>> {
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
            return Ok(createdDocs[0]._id as Types.ObjectId);
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    },

    async updatePreferences(userId: string, preferences: Preferences): Promise<Result<Preferences, Error>> {
        try {
            const updateData = fromPreferences(preferences, userId);
            const updatedDoc = await PreferencesModel.findOneAndUpdate(
                { userId },
                updateData,
                { upsert: true, new: true, runValidators: true }
            );

            if (!updatedDoc) {
                return Err(new Error('Failed to update or create preferences'));
            }
            return Ok(toPreferences(updatedDoc));
        } catch (error) {
            return Err(error instanceof Error ? error : new Error(String(error)));
        }
    }
};

export default preferencesDAO;
