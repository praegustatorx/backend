import { Schema } from "mongoose";

// Schema for GenericIngredient (simplified, assuming it has id and name)
export const GenericIngredientSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    // Add other necessary fields from GenericIngredient
});