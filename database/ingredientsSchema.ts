import { Schema } from "mongoose";

// Schema for GenericIngredient (simplified, assuming it has id and name)
export const GenericIngredientSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    // Add other necessary fields from GenericIngredient
});

// Schema for nutrient amount
 const NutrientAmountSchema = new Schema({
    amount: { type: Number, required: true },
    unit: { type: String, required: true }
}, { _id: false });

// Schema for nutritions
const NutritionsSchema = new Schema({
    portion: NutrientAmountSchema,
    calories: [NutrientAmountSchema],
    protein: NutrientAmountSchema,
    fat: NutrientAmountSchema,
    carbohydrates: NutrientAmountSchema
}, { _id: false });

// Schema for measurement
const MeasurementSchema = new Schema({
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
}, { _id: false });

// Schema for PantryIngredient
export const PantryIngredientSchema = new Schema({
    id: { type: String, required: true },
    brand: { type: String, required: false },
    genericId: { type: String, required: true },
    quantity: MeasurementSchema,
    nutrition: NutritionsSchema,
    expiration_date: { type: Date, required: false }
});