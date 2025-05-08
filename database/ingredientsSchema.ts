import { Schema, model } from "mongoose";

// Abstract schema for {amount: number, unit: string}
const AmountUnitSchema = new Schema({
    amount: { type: Number, required: true },
    unit: { type: String, required: true }
}, { _id: false });

// Schema for Nutritional Information
const NutritionalInformationSchema = new Schema({
    portion: AmountUnitSchema,
    calories: AmountUnitSchema,
    protein: AmountUnitSchema,
    fat: AmountUnitSchema,
    carbohydrates: AmountUnitSchema
}, { _id: false });

export { AmountUnitSchema, NutritionalInformationSchema };

// Schema for PantryIngredient
export const PantryIngredientSchema = new Schema({
    // MongoDB will automatically add _id field for each document
    brand: { type: String, required: false },
    type: { type: String, required: true }, // Changed from genericId to type
    quantity: AmountUnitSchema,
    nutrition: NutritionalInformationSchema,
    expiration_date: { type: Date, required: false }
});

// Create the PantryIngredient model
export const PantryIngredientModel = model('PantryIngredient', PantryIngredientSchema);