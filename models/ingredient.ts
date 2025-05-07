import { None, Option } from "ts-results-es";
import { Nutritions } from "./nutritional_information";

/**
 * Representing abstracted ingredient type definition. 
 */
export type IngredientType = string;

/**
 * Representing the quantity of an ingredient.
*/
type Measurement = {
    amount: number;
    unit: Unit;
}

export const CreateMeasurement = (amount: number, unit: Unit): Measurement => {
    return {
        amount,
        unit
    };
}
// TODO: Create a type PantryUnit, which will be type limited to unit: Unit.MILILITER | Unit.GRAM

// TODO: Add more or less measurements if needed
export enum Unit {
    MILLILITER = "milliliter",
    LITER = "liter",
    GRAM = "gram",
    MILLIGRAM = "milligram",
    KILOGRAM = "kilogram",
    CUP = "cup",
    TABLESPOON = "tablespoon",
    TEASPOON = "teaspoon",
    PINCH = "pinch",
}

// TODO: keep ingredient's measurements only in mililiter and gram.
/** 
 * Representing an ingredient in the pantry.
 * The pantry ingredient is a concrete example of an ingredient with a brand and additional information.
*/
export type PantryIngredient = {
    id: string;
    brand: Option<string>;
    type: IngredientType;
    quantity: Option<Measurement>;
    nutrition: Nutritions;
    expiration_date: Option<ExpDate>;
}

export const CreatePantryIngredient = (
    id: string,
    brand: Option<string> = None,
    type: IngredientType,
    quantity: Option<Measurement> = None,
    nutrition: Nutritions,
    expiration_date: Option<ExpDate> = None
): PantryIngredient => {
    return {
        id,
        brand,
        type,
        quantity,
        nutrition,
        expiration_date
    };
}

export type ExpDate = Date;

export const CreateExpDate = (
    year?: number,
    month?: number,
    day?: number
): ExpDate => {
    let date: Date;

    if (year === undefined || month === undefined || day === undefined) {
        date = new Date();
    } else {
        date = new Date(year, month, day);
    }

    date.setHours(23, 59, 59, 999); // Set to the end of the day
    return date;
};

export const isIngredientExpired = (ingredient: PantryIngredient, date: ExpDate = CreateExpDate()): boolean => {
    return ingredient.expiration_date
        .map((expDate) => expDate <= date)
        .unwrapOrElse(() => false);
}

/**
 * Representing a recipe ingredient.
 * The recipe ingredient is a concrete example with quantity.
*/
export type RecipeIngredient = {
    type: IngredientType;
    quantity: Option<Measurement>;
}

export const CreateRecipeIngredient = (
    type: IngredientType,
    quantity: Option<Measurement> = None
): RecipeIngredient => {
    return {
        type,
        quantity
    };
}
