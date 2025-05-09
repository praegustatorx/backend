import { Err, None, Ok, Option, Result, Some } from "ts-results-es";
import { Nutrition } from "./nutritional_information";

/**
 * Representing abstracted ingredient type definition. 
 */
export type IngredientType = string;

/**
 * Representing the quantity of an ingredient.
 * @field amount - validation should be done before creating!.
*/
export type Measurement = {
    amount: number;
    unit: Unit;
}

export const createMeasurement = (amount: number, unit: Unit): Measurement => {
    return {
        amount,
        unit
    };
}
// TODO: Create a type PantryUnit, which will be type limited to unit: Unit.MILILITER | Unit.GRAM

// TODO: Add more or less measurements if needed such as Dl or Cl
export enum Unit {
    ML = "ml",
    L = "l",
    G = "g",
    MG = "mg",
    KG = "kg",
    CUP = "cup",
    TBSP = "tbsp",
    TSP = "tsp",
    PINCH = "pinch",
}

// ----------------- Pantry Ingredient ----------------- //

// TODO: keep ingredient's measurements only in mililiter and gram.
/// This type will be used only when creating a pantry ingredient.
export type PantryIngredient = {
    type: IngredientType;
    brand: Option<string>;
    quantity: Option<Measurement>;
    nutrition: Option<Nutrition>;
    expiration_date: Option<ExpDate>;
}

export const createPantryIngredient = (
    type: IngredientType,
    brand?: string,
    quantity?: Measurement,
    nutrition?: Nutrition,
    expiration_date?: ExpDate
): PantryIngredient => {
    return newPantryIngredient(
        type,
        brand ? Some(brand) : None,
        quantity ? Some(quantity) : None,
        nutrition ? Some(nutrition) : None,
        expiration_date ? Some(expiration_date) : None
    );
}

export const newPantryIngredient = (
    type: IngredientType,
    brand: Option<string>,
    quantity: Option<Measurement>,
    nutrition: Option<Nutrition>,
    expiration_date: Option<ExpDate>
): PantryIngredient => {
    return {
        type,
        brand,
        quantity,
        nutrition,
        expiration_date
    };
}

//  ----------------- Database persisted Pantry Ingredient ----------------- //

export type DbPantryIngredient = {
    id: string;
} & PantryIngredient;

export type ExpDate = Date;

export const createExpDate = (
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

export const createExpDateFromMills = (mills: number): ExpDate => {
    const date = new Date(mills);
    date.setHours(23, 59, 59, 999); // Set to the end of the day
    return date;
}

export const parseExpDate = (dateString?: string): Result<ExpDate, void> => {
    if (!dateString) return Ok(createExpDate());


    const mills = Date.parse(dateString);
    if (isNaN(mills)) return Err(undefined); // Invalid date string

    const date = new Date(mills);
    date.setHours(23, 59, 59, 999); // Set to the end of the day
    return Ok(date);
}

export const isIngredientExpired = (ingredient: PantryIngredient | DbPantryIngredient, date: ExpDate = createExpDate()): boolean => {
    return ingredient.expiration_date
        .map((expDate) => expDate <= date)
        .unwrapOrElse(() => false);
}

// ----------------- Recipe Ingredient ----------------- //

/**
 * Representing a recipe ingredient.
 * The recipe ingredient is a concrete example with quantity.
*/
export type RecipeIngredient = {
    type: IngredientType;
    quantity: Option<Measurement>;
}

export const createRecipeIngredient = (
    type: IngredientType,
    quantity: Option<Measurement> = None
): RecipeIngredient => {
    return {
        type,
        quantity
    };
}
