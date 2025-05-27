import {
    NutrientUnit,
    createNutrition,
    createNutrientAmount,
    newNutrition,
} from "../../models/nutritional_information";

describe('Nutritional Information Module', () => {
    describe('NutrientAmount', () => {
        it('should create a nutrient amount object', () => {
            const amount = 100;
            const unit = NutrientUnit.GRAM;
            const nutrientAmount = createNutrientAmount(amount, unit);

            expect(nutrientAmount.amount).toBe(amount);
            expect(nutrientAmount.unit).toBe(unit);
        });
    });

    describe('Nutrition', () => {
        it('should create a Nutrition object with provided values', () => {
            const portionAmount = 200;
            const caloriesAmount = 150;
            const proteinAmount = 10;
            const fatAmount = 5;
            const carbohydratesAmount = 30;

            const nutrition = createNutrition(
                createNutrientAmount(portionAmount, NutrientUnit.GRAM),
                caloriesAmount,
                proteinAmount,
                fatAmount,
                carbohydratesAmount
            );

            expect(nutrition.portion.amount).toBe(portionAmount);
            expect(nutrition.calories.amount).toBe(caloriesAmount);
            expect(nutrition.calories.unit).toBe(NutrientUnit.CALORIES);
            expect(nutrition.protein.amount).toBe(proteinAmount);
            expect(nutrition.fat.amount).toBe(fatAmount);
            expect(nutrition.carbohydrates.amount).toBe(carbohydratesAmount);
        });

        it('should create a Nutrition object with default values', () => {
            const nutrition = createNutrition();

            expect(nutrition.portion.amount).toBe(100);
            expect(nutrition.portion.unit).toBe(NutrientUnit.GRAM);
            expect(nutrition.calories.amount).toBe(0);
            expect(nutrition.calories.unit).toBe(NutrientUnit.CALORIES);
            expect(nutrition.protein.amount).toBe(0);
            expect(nutrition.fat.amount).toBe(0);
            expect(nutrition.carbohydrates.amount).toBe(0);
        });
    });

    describe('newNutrition', () => {
        it('should create a Nutrition object with explicitly provided NutrientAmount objects', () => {
            const portion = createNutrientAmount(150, NutrientUnit.GRAM);
            const calories = createNutrientAmount(250, NutrientUnit.CALORIES);
            const protein = createNutrientAmount(20, NutrientUnit.GRAM);
            const fat = createNutrientAmount(8, NutrientUnit.GRAM);
            const carbohydrates = createNutrientAmount(40, NutrientUnit.GRAM);

            const nutrition = newNutrition(portion, calories, protein, fat, carbohydrates);

            expect(nutrition.portion).toBe(portion);
            expect(nutrition.calories).toBe(calories);
            expect(nutrition.protein).toBe(protein);
            expect(nutrition.fat).toBe(fat);
            expect(nutrition.carbohydrates).toBe(carbohydrates);
        });
    });
});