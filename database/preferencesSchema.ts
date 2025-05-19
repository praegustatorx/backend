import { Schema, Document, model, Types } from 'mongoose';
import { Preferences, Allergy, Diet, preferencesFromDTO } from '../models/preferences';
import { IngredientType } from '../models/ingredient';

// Schema for Diet
const DietSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }
});

// Document interface for Diet
export interface DietDocument extends Document {
    name: string;
    description: string;
}

const AllergySchema = new Schema({
    name: {
        type: String,
        required: true,
        enum: Object.values(Allergy) // Use enum validation with values from Allergy enum
    },
});

// Document interface for Allergy
export interface AllergyDocument extends Document {
    name: string;
}

// Document interface for a single blacklisted ingredient
export interface BlacklistedIngredientDocument extends Document {
    value: IngredientType;
}

// Represents the plain JS object structure Mongoose accepts for creating/updating
export interface PreferencesInputData {
    userId: string;
    allergies: string[]; // Changed Allergy to string, made non-optional
    diets: Diet[]; // Made non-optional
    blacklist: IngredientType[]; // Changed from { value: IngredientType }[]
}

// Interface for the Preferences document (instantiated Mongoose document)
export interface PreferencesDocument extends Document {
    userId: string;
    allergies: Types.DocumentArray<AllergyDocument>;
    diets: Types.DocumentArray<DietDocument>;
    blacklist: Types.Array<IngredientType>; // Changed from Types.DocumentArray<BlacklistedIngredientDocument>
}

const PreferencesSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    allergies: [AllergySchema],
    diets: [DietSchema],
    blacklist: [String] // Updated to store strings directly
});

const PreferencesModel = model<PreferencesDocument>('Preferences', PreferencesSchema);

export default PreferencesModel;

// Utility functions to convert between Mongoose model and domain model
export const toPreferences = (doc: PreferencesDocument): Preferences => {
    const diets = doc.diets.map(d => ({ name: d.name, description: d.description }));
    // doc.blacklist is now Types.Array<IngredientType>, convert to plain array
    const blacklist = doc.blacklist ? [...doc.blacklist] : [];

    const allergies = doc.allergies.map(a => a.name as Allergy); // Cast to Allergy enum
    return preferencesFromDTO({
        allergies,
        diets,
        blacklist
    });
};

export const fromPreferences = (preferences: Preferences, userId: string): PreferencesInputData => {
    return {
        userId,
        allergies: [...preferences.allergies],
        diets: [...preferences.diets],
        blacklist: [...preferences.blacklist] // Changed from mapping to { value: b }
    };
};
