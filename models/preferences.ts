import { Err, Ok, Result } from "ts-results-es";
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