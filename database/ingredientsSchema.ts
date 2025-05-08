import { Schema, model, Document } from "mongoose";

// --------------- Schema Definitions --------------- //

// Abstract schema for {amount: number, unit: string}
const AmountUnitSchema = new Schema(
  {
    amount: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  { _id: false }
);

// Schema for Nutritional Information
const NutritionalInformationSchema = new Schema(
  {
    portion: AmountUnitSchema,
    calories: AmountUnitSchema,
    protein: AmountUnitSchema,
    fat: AmountUnitSchema,
    carbohydrates: AmountUnitSchema,
  },
  { _id: false }
);

export { AmountUnitSchema, NutritionalInformationSchema };

// Schema for PantryIngredient
export const PantryIngredientSchema = new Schema({
  // MongoDB will automatically add _id field for each document
  type: { type: String, required: true },
  brand: { type: String, required: false },
  quantity: { type: AmountUnitSchema, required: false },
  nutrition: { type: NutritionalInformationSchema, required: false },
  expiration_date: { type: Date, required: false },
});

// Create the PantryIngredient model
export const PantryIngredientModel = model<PantryIngredientDoc>(
  "PantryIngredient",
  PantryIngredientSchema
);

// --------------- Document Interfaces --------------- //

// Interfaces for Mongoose Documents
export interface AmountUnitDoc extends Document {
  amount: number;
  unit: string;
}

export interface NutritionalInformationDoc extends Document {
  portion?: AmountUnitDoc;
  calories?: AmountUnitDoc;
  protein?: AmountUnitDoc;
  fat?: AmountUnitDoc;
  carbohydrates?: AmountUnitDoc;
}

export interface PantryIngredientDoc extends Document {
  type: string;
  brand?: string;
  quantity?: AmountUnitDoc;
  nutrition?: NutritionalInformationDoc;
  expiration_date?: Date;
}
