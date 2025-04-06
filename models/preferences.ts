import { Option, Err, Ok, Result, None } from "ts-results-es";
import { GenericIngredient } from "./ingredient";

// ----- Preferences -----
export type Preferences = {
  allergies: Option<Allergy[]>;
  diets: Option<Diet[]>;
  blacklist: Option<Blacklist>;
};

const createPreferences = (allergies: Option<Allergy[]> = None, diets: Option<Diet[]> = None, blacklist: Option<Blacklist> = None): Preferences => {
  return { allergies, diets, blacklist };
};

// ----- Diet -----
export type Diet = {
  name: string;
  description: string;
};

export const createDiet = (name: string, description: string): Result<Diet, string[]> => {
  const errors: string[] = [];

  if (!name) {
    errors.push('Diet name is required.');
  }

  if (!description) {
    errors.push('Diet description is required.');
  }

  if (errors.length > 0) {
    return Err(errors);
  }

  return Ok({ name, description });
};

// ----- Allergy -----
export enum Allergy {
  Nuts = 'Nuts',
  Dairy = 'Dairy',
  Gluten = 'Gluten',
  Soy = 'Soy',
  Shellfish = 'Shellfish',
  Eggs = 'Eggs',
  Fish = 'Fish',
  Sesame = 'Sesame',
  Other = 'Other',
}

// ----- Blacklist -----
// TODO: implement with Map if frequent queries are required
/**
 * Represents a blacklist of ingredients that the user doesn't like in addition to other set preferences.
 */
export type Blacklist = {
  items: GenericIngredient[];
}

export const CreateBlacklist = (): Blacklist => {
  return {
    items: []
  };
};

export const addToBlacklist = (blacklist: Blacklist, ingredient: GenericIngredient): Blacklist => {
  // Check if ingredient is already in blacklist to avoid duplicates
  if (!isBlacklisted(blacklist, ingredient.id)) {
    blacklist.items.push(ingredient);
  }
  return blacklist;
};

export const removeFromBlacklist = (blacklist: Blacklist, ingredientId: string): Blacklist => {
  blacklist.items = blacklist.items.filter(item => item.id !== ingredientId);
  return blacklist;
};

export const isBlacklisted = (blacklist: Blacklist, ingredientId: string): boolean => {
  return blacklist.items.some(item => item.id === ingredientId);
};
