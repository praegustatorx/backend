import { Option, Err, Ok, Result, None, Some } from "ts-results-es";
import { IngredientType } from "./ingredient";

// ----- Preferences -----
// Sets are used to avoid duplicates, reducing checking logic in the functions
export type Preferences = {
  allergies: Set<Allergy>;
  diets: Set<Diet>;
  blacklist: Set<IngredientType>;
};

export const createPreferences = (
  allergies: Set<Allergy> = new Set(),
  diets: Set<Diet> = new Set(),
  blacklist: Set<IngredientType> = new Set()
): Preferences => {
  return { allergies, diets, blacklist };
};

// ----- Preferences DTO -----
// Used as local type instead of having each field as function arguments. Supposed to be used as {field1, field2, field3}
type PreferencesDTO = {
  allergies: Allergy[];
  diets: Diet[];
  blacklist: IngredientType[];
};

export const preferencesIntoDTO = (preferences: Preferences): PreferencesDTO => {
  return {
    allergies: [...preferences.allergies],
    diets: [...preferences.diets],
    blacklist: [...preferences.blacklist],
  };
};

export const preferencesFromDTO = (dto: PreferencesDTO): Preferences => {
  return createPreferences(
    new Set(dto.allergies),
    new Set(dto.diets),
    new Set(dto.blacklist)
  );
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
  preferences.allergies.add(allergy);
};

export const removeAllergy = (preferences: Preferences, allergy: Allergy): Result<void, Error> => {
  if (preferences.allergies.has(allergy)) {
    preferences.allergies.delete(allergy);
    return Ok(undefined);
  } else {
    return Err(new Error('Allergy not found in preferences.'));
  }
};

export const hasAllergy = (preferences: Preferences, allergy: Allergy): boolean => {
  return preferences.allergies.has(allergy);
};

// Returns a copy of the allergies array. Any modifications to the returned array will not affect the original allergies in preferences.
export const getAllergies = (preferences: Preferences): Allergy[] => {
  return [...preferences.allergies];
};

// ----- Preferences Functions for Diets -----
export const addDiet = (preferences: Preferences, diet: Diet) => {
  preferences.diets.add(diet);
};

export const removeDietByName = (preferences: Preferences, dietName: string): Result<void, Error> => {
  for (const diet of preferences.diets) {
    if (diet.name === dietName) {
      preferences.diets.delete(diet);
      return Ok(undefined);
    }
  }
  return Err(new Error('Diet not found in preferences.'));
};

export const hasDiet = (preferences: Preferences, dietName: string): boolean => {
  for (const diet of preferences.diets) {
    if (diet.name === dietName) {
      return true;
    }
  }
  return false;
};

// Returns a copy of the diets array. Any modifications to the returned array will not affect the original diets in preferences.
export const getDiets = (preferences: Preferences): Diet[] => {
  return [...preferences.diets];
};

// ----- Preferences Functions for Blacklist -----
export const addToBlacklist = (preferences: Preferences, ingredient: IngredientType): void => {
  // Sets automatically handle duplicates
  preferences.blacklist.add(ingredient);
}

export const removeFromBlacklist = (preferences: Preferences, ingredientId: string): Result<void, Error> => {
  if (preferences.blacklist.size === 0) {
    return Err(new Error('Blacklist is empty.'));
  }

  return preferences.blacklist.delete(ingredientId) ? Ok(undefined) : Err(new Error('Ingredient not found in blacklist.'));
}

export const isBlacklisted = (preferences: Preferences, ingredientId: string): boolean => {
  return preferences.blacklist.has(ingredientId);
};
