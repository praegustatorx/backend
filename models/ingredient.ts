import { Option } from "ts-results-es";
import { Nutritions } from "./nutritional_information";

/**
 * Representing abstracted ingredient definition. 
 */
type GenericIngredient = {
    id: string;
    name: string;
}

/**
 * Representing the quantity of an ingredient.
*/
type Measurement = {
    quantity: number;
    unit: Unit;
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
}

/**
 * Representing a recipe ingredient.
 * The recipe ingredient is a concrete example of a generic ingredient with quantity.
*/
type RecipeIngredient = {
    genericId: string;
    quantity: Option<Measurement>;
}
