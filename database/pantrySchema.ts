import { Schema, Document, model } from "mongoose";
import {
  PantryIngredientDoc,
  PantryIngredientSchema,
  toDbPantryIngredient,
} from "./ingredientsSchema";
import { PantryDTO } from "../models/pantry";

// Pantry Schema
const PantrySchema = new Schema({
  userId: { type: String, required: true, unique: true },
  ingredients: [PantryIngredientSchema],
});

// Interface for Mongoose Document
export interface PantryDocument extends Document {
  userId: string;
  ingredients: PantryIngredientDoc[];
}

const PantryModel = model<PantryDocument>("Pantry", PantrySchema);

export default PantryModel;

export const toPantryDto = (doc: PantryDocument): PantryDTO => {
  return {
    userId: doc.userId,
    ingredients: doc.ingredients.map((ingredientDoc) => toDbPantryIngredient(ingredientDoc)),
  };
 }
