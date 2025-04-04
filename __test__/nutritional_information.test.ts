import {

    NutrientUnit,
    createNutrientAmount,
    createNutritions
} from "../models/nutritional_information";

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

    describe('Nutritions', () => {
        it('should create a nutritions object with provided values', () => {
            const portionAmount = 200;
            const caloriesAmount = 150;
            const proteinAmount = 10;
            const fatAmount = 5;
            const carbohydratesAmount = 30;

            const nutritions = createNutritions(
                createNutrientAmount(portionAmount, NutrientUnit.GRAM),
                caloriesAmount,
                proteinAmount,
                fatAmount,
                carbohydratesAmount
            );

            expect(nutritions.portion.amount).toBe(portionAmount);
            expect(nutritions.calories[1].amount).toBe(caloriesAmount);
            expect(nutritions.protein.amount).toBe(proteinAmount);
            expect(nutritions.fat.amount).toBe(fatAmount);
            expect(nutritions.carbohydrates.amount).toBe(carbohydratesAmount);
        });

        it('should create a nutritions object with default values', () => {
            const nutritions = createNutritions();

            expect(nutritions.portion.amount).toBe(100);
            expect(nutritions.portion.unit).toBe(NutrientUnit.GRAM);
            expect(nutritions.calories[1].amount).toBe(0);
            expect(nutritions.protein.amount).toBe(0);
            expect(nutritions.fat.amount).toBe(0);
            expect(nutritions.carbohydrates.amount).toBe(0);
        });

        it('should calculate kilojoules correctly from calories', () => {
            const caloriesAmount = 150;
            const nutritions = createNutritions(
                createNutrientAmount(100, NutrientUnit.GRAM),
                caloriesAmount,
                0,
                0,
                0
            );

            expect(nutritions.calories[0].amount).toBeCloseTo(caloriesAmount * 4.184, 2);
            expect(nutritions.calories[0].unit).toBe(NutrientUnit.KILOJOULES);
        });
    });
});