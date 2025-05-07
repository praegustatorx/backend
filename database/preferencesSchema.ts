import { Schema, Document, model } from 'mongoose';
import { Preferences, Allergy, Diet, preferencesFromDTO } from '../models/preferences';
import { IngredientType } from '../models/ingredient';

// Schema for Diet
const DietSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }
});

// Interface for the Preferences document
export interface PreferencesDocument extends Document {
    userId: string;
    allergies: Allergy[];
    diets: Diet[];
    blacklist: string[]; // Changed to string[] as IngredientType is string
}

// Preferences Schema
const PreferencesSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    allergies: [{
        type: String,
        enum: Object.values(Allergy),
        default: []
    }],
    diets: [DietSchema],
    blacklist: [String] // Changed to use String type directly instead of GenericIngredientSchema
});

const PreferencesModel = model<PreferencesDocument>('Preferences', PreferencesSchema);

export default PreferencesModel;

// Utility functions to convert between Mongoose model and domain model
export const toPreferences = (doc: PreferencesDocument): Preferences => {
    const allergies = doc.allergies as Allergy[];
    const diets = doc.diets as Diet[];
    const blacklist = doc.blacklist as IngredientType[]; // Changed to string[]
    return preferencesFromDTO({ allergies, diets, blacklist });
};

export const fromPreferences = (preferences: Preferences, userId: string): Partial<PreferencesDocument> => {
    return {
        userId,
        allergies: [...preferences.allergies],
        diets: [...preferences.diets],
        blacklist: [...preferences.blacklist]
    };
};
