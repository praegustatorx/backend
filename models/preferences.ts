import { Option, Err, Ok, Result, None } from "ts-results-es";

// ----- Preferences -----
export type Preferences = {
  allergies: Option<Allergy[]>;
  diets: Option<Diet[]>;
};

export const createPreferences = (allergies: Option<Allergy[]> = None, diets: Option<Diet[]> = None): Preferences => {
  return { allergies, diets };
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