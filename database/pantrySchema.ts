import { Schema, Document, model } from "mongoose";
import {
  PantryIngredientDoc,
  PantryIngredientSchema,
} from "./ingredientsSchema";

// Pantry Schema
const PantrySchema = new Schema({
  userId: { type: String, required: true, unique: true },
  ingredients: [PantryIngredientSchema],
});

const PantryModel = model<PantryDoc>("Pantry", PantrySchema);

export default PantryModel;

interface PantryDoc extends Document {
  userId: string;
  ingredients: PantryIngredientDoc[];
}
