import { Option, Err, Ok, Result, None, Some } from "ts-results-es";
import { GenericIngredient } from "./ingredient";

// ----- Preferences -----
export type Preferences = {
  allergies: Option<Set<Allergy>>;
  diets: Option<Set<Diet>>;
  blacklist: Option<Set<GenericIngredient>>;
};

export const createPreferences = (allergies: Option<Set<Allergy>> = None, diets: Option<Set<Diet>> = None, blacklist: Option<Set<GenericIngredient>> = None): Preferences => {
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

// ----- Preferences Functions for Allergies -----

export const addAllergy = (preferences: Preferences, allergy: Allergy) => {
  if (preferences.allergies.isNone()) {
    preferences.allergies = Some(new Set<Allergy>());
  }

  preferences.allergies = preferences.allergies.map(allergies => { allergies.add(allergy); return allergies });
};

export const removeAllergy = (preferences: Preferences, allergy: Allergy): Result<void, Error> => {
  if (preferences.allergies.isSome()) {
    preferences.allergies.unwrap().delete(allergy);
    return Ok(undefined);
  } else {
    return Err(new Error('No allergies found in preferences.'));
  }
};

export const hasAllergy = (preferences: Preferences, allergy: Allergy): boolean => {
  return preferences.allergies.isSome() && preferences.allergies.unwrap().has(allergy);
};

export const getAllergies = (preferences: Preferences): Allergy[] => {
  return preferences.allergies.map(allergies => Array.from(allergies)).unwrapOr([]);
};

// ----- Preferences Functions for Diets -----
export const addDiet = (preferences: Preferences, diet: Diet) => {
  if (preferences.diets.isNone()) {
    preferences.diets = Some(new Set<Diet>());
  }

  preferences.diets = preferences.diets.map(diets => { diets.add(diet); return diets });
};

export const removeDietByName = (preferences: Preferences, dietName: string): Result<void, Error> => {
  if (preferences.diets.isSome()) {
    const diets = preferences.diets.unwrap();
    // Convert Set to array, filter, and convert back to Set
    const updatedDiets = new Set(Array.from(diets).filter(d => d.name !== dietName));
    preferences.diets = Some(updatedDiets);
    return Ok(undefined);
  } else {
    return Err(new Error('No diets found in preferences.'));
  }
};

export const hasDiet = (preferences: Preferences, dietName: string): boolean => {
  if (preferences.diets.isNone()) {
    return false;
  }

  const diets = preferences.diets.unwrap();
  for (const diet of diets) {
    if (diet.name === dietName) {
      return true;
    }
  }
  return false;
};

export const getDiets = (preferences: Preferences): Diet[] => {
  return preferences.diets.map(diets => Array.from(diets)).unwrapOr([]);
};

// ----- Preferences Functions for Blacklist -----
export const addToBlacklist = (preferences: Preferences, ingredient: GenericIngredient): void => {
  // Check if ingredient is already in blacklist to avoid duplicates
  const blacklist = preferences.blacklist;
  if (blacklist.isSome()) {
    blacklist.unwrap().add(ingredient);
  } else {
    preferences.blacklist = Some(new Set([ingredient]));
  };
}

export const removeFromBlacklist = (preferences: Preferences, ingredientId: string): Result<void, Error> => {
  if (preferences.blacklist.isNone()) {
    return Err(new Error('No blacklist found in preferences.'));
  }
  const blacklist = preferences.blacklist.unwrap();
  const ingredientToRemove = Array.from(blacklist).find(ingredient => ingredient.id === ingredientId);
  if (ingredientToRemove) {
    blacklist.delete(ingredientToRemove);
    return Ok(undefined);
  } else {
    return Err(new Error('Ingredient not found in blacklist.'));
  };
}

export const isBlacklisted = (preferences: Preferences, ingredientId: string): boolean => {
  if (preferences.blacklist.isNone()) {
    return false;
  }
  const blacklist = preferences.blacklist.unwrap();
  return Array.from(blacklist).some(item => item.id === ingredientId);
};
