import { Schema, model, Document } from "mongoose";
import { createPantryIngredient, DbPantryIngredient, Measurement, newPantryIngredient, Unit } from "../models/ingredient";
import { createNutrition, NutrientAmount, NutrientUnit, Nutrition } from "../models/nutritional_information";
import { None, Some } from "ts-results-es";

// --------------- Schema Definitions --------------- //

// Abstract schema for {amount: number, unit: string}
export const AmountUnitSchema = new Schema(
    {
        amount: { type: Number, required: true },
        unit: { type: String, required: true },
    },
    { _id: false }
);

// Schema for Nutritional Information
export const NutritionalInformationSchema = new Schema(
    {
        portion: AmountUnitSchema,
        calories: AmountUnitSchema,
        protein: AmountUnitSchema,
        fat: AmountUnitSchema,
        carbohydrates: AmountUnitSchema,
    },
    { _id: false }
);

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
export interface MeasurementDoc extends Document {
    amount: number;
    unit: string;
}

export interface NutritionalInformationDoc extends Document {
    portion?: MeasurementDoc;
    calories?: MeasurementDoc;
    protein?: MeasurementDoc;
    fat?: MeasurementDoc;
    carbohydrates?: MeasurementDoc;
}

export interface PantryIngredientDoc extends Document {
    type: string;
    brand?: string;
    quantity?: MeasurementDoc;
    nutrition?: NutritionalInformationDoc;
    expiration_date?: Date;
}

// --------------- Utility Functions --------------- //

// ### From Document ### //

const toMeasurement = (doc: MeasurementDoc): Measurement => {
    return {
        amount: doc.amount,
        unit: doc.unit as Unit,
    };
}

const toNutritionalAmount = (doc: MeasurementDoc): NutrientAmount => {
    return {
        amount: doc.amount,
        unit: doc.unit as NutrientUnit,
    };
}

const toNutritionalInformation = (doc: NutritionalInformationDoc): Nutrition => {
    const portion = doc.portion ? toNutritionalAmount(doc.portion) : undefined;
    const calories = doc.calories ? toNutritionalAmount(doc.calories).amount : undefined;
    const protein = doc.protein ? toNutritionalAmount(doc.protein).amount : undefined;
    const fat = doc.fat ? toNutritionalAmount(doc.fat).amount : undefined;
    const carbohydrates = doc.carbohydrates ? toNutritionalAmount(doc.carbohydrates).amount : undefined;

    return createNutrition(portion, calories, protein, fat, carbohydrates);
}


export const toDbPantryIngredient = (doc: PantryIngredientDoc): DbPantryIngredient => {
    const brand = doc.brand ? Some(doc.brand) : None;
    const quantityOption = doc.quantity ? Some(toMeasurement(doc.quantity)) : None;
    const nutritionOption = doc.nutrition ? Some(toNutritionalInformation(doc.nutrition)) : None;
    const expirationDate = doc.expiration_date ? Some(doc.expiration_date) : None;

    const pantryIngredient = newPantryIngredient(
        doc.type,
        brand,
        quantityOption,
        nutritionOption,
        expirationDate
    );

    return {
        id: doc.id,
        ...pantryIngredient,
    };
}

// ### To Document ### //
const toMeasurementDoc = (measurement: Measurement): MeasurementDoc => {
    return {
        amount: measurement.amount,
        unit: measurement.unit,
    } as MeasurementDoc;
}

const toNutritionalAmountDoc = (amount: NutrientAmount): MeasurementDoc => {
    return {
        amount: amount.amount,
        unit: amount.unit,
    } as MeasurementDoc;
}

const toNutritionalInformationDoc = (nutrition: Nutrition): NutritionalInformationDoc => {
    const { portion, calories, protein, fat, carbohydrates } = nutrition;
    const portionDoc = portion ? toNutritionalAmountDoc(portion) : undefined;
    const caloriesDoc = calories ? toNutritionalAmountDoc(calories) : undefined;
    const proteinDoc = protein ? toNutritionalAmountDoc(protein) : undefined;
    const fatDoc = fat ? toNutritionalAmountDoc(fat) : undefined;
    const carbohydratesDoc = carbohydrates ? toNutritionalAmountDoc(carbohydrates) : undefined;

    return {
        portion: portionDoc,
        calories: caloriesDoc,
        protein: proteinDoc,
        fat: fatDoc,
        carbohydrates: carbohydratesDoc,
    } as NutritionalInformationDoc;
}

export const toPantryIngredientDoc = (ingredient: Partial<DbPantryIngredient>): Partial<PantryIngredientDoc> => {
    const { type, brand, quantity, nutrition, expiration_date } = ingredient;
    
    const doc: Partial<PantryIngredientDoc> = {};
    if (type !== undefined) doc.type = type;
    if (brand !== undefined && brand.isSome()) doc.brand = brand.unwrap();
    if (quantity !== undefined && quantity.isSome()) doc.quantity = toMeasurementDoc(quantity.unwrap());
    if (nutrition !== undefined && nutrition.isSome()) doc.nutrition = toNutritionalInformationDoc(nutrition.unwrap());
    if (expiration_date !== undefined && expiration_date.isSome()) doc.expiration_date = expiration_date.unwrap();

    return doc;
}

export const toPantryIngredientDocForCreation = (ingredient: DbPantryIngredient): PantryIngredientDoc => {
    const { type, brand, quantity, nutrition, expiration_date } = ingredient;
    const brandDoc = brand.isSome() ? brand.unwrap() : undefined;
    const quantityDoc = quantity.isSome() ? toMeasurementDoc(quantity.unwrap()) : undefined;
    const nutritionDoc = nutrition.isSome() ? toNutritionalInformationDoc(nutrition.unwrap()) : undefined;
    const expirationDateDoc = expiration_date.isSome() ? expiration_date.unwrap() : undefined;

    return {
        type,
        brand: brandDoc,
        quantity: quantityDoc,
        nutrition: nutritionDoc,
        expiration_date: expirationDateDoc,
    } as PantryIngredientDoc;
}
