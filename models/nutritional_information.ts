export type Nutrition = {
  portion: NutrientAmount;
  calories: NutrientAmount;
  protein: NutrientAmount;
  fat: NutrientAmount;
  carbohydrates: NutrientAmount;
};

export const createNutrition = (
  portion: NutrientAmount = createNutrientAmount(100, NutrientUnit.GRAM),
  calories_amount: number = 0,
  protein_amount: number = 0,
  fat_amount: number = 0,
  carbohydrates_amount: number = 0
): Nutrition => {
  const calories = createNutrientAmount(calories_amount, NutrientUnit.CALORIES);
  const protein = createNutrientAmount(protein_amount, NutrientUnit.GRAM);
  const fat = createNutrientAmount(fat_amount, NutrientUnit.GRAM);
  const carbohydrates = createNutrientAmount(
    carbohydrates_amount,
    NutrientUnit.GRAM
  );

  return newNutrition(portion, calories, protein, fat, carbohydrates);
};

export const newNutrition = (
  portion: NutrientAmount,
  calories: NutrientAmount,
  protein: NutrientAmount,
  fat: NutrientAmount,
  carbohydrates: NutrientAmount
): Nutrition => {
  return { portion, calories, protein, fat, carbohydrates };
};

/**
 * Nutritional Amount per Portion
 */
export type NutrientAmount = {
  amount: number;
  unit: NutrientUnit;
};

export const createNutrientAmount = (
  amount: number,
  unit: NutrientUnit
): NutrientAmount => {
  return { amount, unit };
};

/**
 *  Nutritional Measuring Units
 */
export enum NutrientUnit {
  GRAM = "g",
  CALORIES = "kcal",
}
