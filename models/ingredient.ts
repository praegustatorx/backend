import { None, Option, Some } from "ts-results-es";
import { Nutritions } from "./nutritional_information";

/**
 * Representing abstracted ingredient definition. 
 */
type GenericIngredient = {
    id: string;
    name: string;
}

export function CreateGenericIngredient(id: string, name: string): GenericIngredient {
    return {
        id,
        name
    };
}

/**
 * Representing the quantity of an ingredient.
*/
type Measurement = {
    quantity: number;
    unit: Unit;
}

export function CreateMeasurement(quantity: number, unit: Unit): Measurement {
    return {
        quantity,
        unit
    };
}
// TODO: Create a type PantryUnit, which will be type limited to unit: Unit.MILILITER | Unit.GRAM

// TODO: Add more or less measurements if needed
enum Unit {
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
 * The pantry ingredient is a concrete example of a generic ingredient with a brand and additional information.
*/
export type PantryIngredient = {
    id: string;
    brand: Option<string>;
    genericId: string;
    quantity: Option<Measurement>;
    nutrition: Nutritions;
    expiration_date: Option<ExpDate>;
}

export function CreatePantryIngredient(
    id: string,
    brand: Option<string> = None,
    genericId: string,
    quantity: Option<Measurement> = None,
    nutrition: Nutritions,
    expiration_date: Option<ExpDate> = None
): PantryIngredient {
    return {
        id,
        brand,
        genericId,
        quantity,
        nutrition,
        expiration_date
    };
}

type ExpDate = Date;

const CreateExpDate = (
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

    date.setHours(0, 0, 0, 0);
    return date;
};

const isIngredientExpired = (ingredient: PantryIngredient, date: ExpDate = CreateExpDate()): boolean => {
    return ingredient.expiration_date
        .map((expDate) => expDate < date)
        .unwrapOrElse(() => false);
}

/**
 * Representing a recipe ingredient.
 * The recipe ingredient is a concrete example of a generic ingredient with quantity.
*/
type RecipeIngredient = {
    genericId: string;
    quantity: Option<Measurement>;
}

export function CreateRecipeIngredient(
    genericId: string,
    quantity: Option<Measurement> = None
): RecipeIngredient {
    return {
        genericId,
        quantity
    };
}
