// TODO: Add abstractions 
export type Nutritions = {
    portion: NutrientAmount;
    calories: [NutrientAmount, NutrientAmount];
    protein: NutrientAmount;
    fat: NutrientAmount;
    carbohydrates: NutrientAmount;
};

export const createNutritions = (
    portion: NutrientAmount = createNutrientAmount(100, NutrientUnit.GRAM),
    calories_amount: number = 0,
    protein_amount: number = 0,
    fat_amount: number = 0,
    carbohydrates_amount: number = 0
): Nutritions => {
    const calories = createNutrientAmount(calories_amount, NutrientUnit.CALORIES);
    const kilojoules = createNutrientAmount(calories_amount * 4.184, NutrientUnit.KILOJOULES);
    const protein = createNutrientAmount(protein_amount, NutrientUnit.GRAM);
    const fat = createNutrientAmount(fat_amount, NutrientUnit.GRAM);
    const carbohydrates = createNutrientAmount(carbohydrates_amount, NutrientUnit.GRAM);

    return { portion, calories: [kilojoules, calories], protein, fat, carbohydrates };
};

/**
 * Nutritional Amount per Portion
 */
type NutrientAmount = {
    amount: number;
    unit: NutrientUnit;
}

export const createNutrientAmount = (amount: number, unit: NutrientUnit): NutrientAmount => {
    return { amount, unit };
};

/**
 *  Nutritional Measuring Units
 */
export enum NutrientUnit {
    GRAM = "g",
    CALORIES = "kcal",
    KILOJOULES = "kj",
}
