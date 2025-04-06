import { createPantry, addIngredient, removeIngredient, getExpiredIngredients, Pantry } from '../models/pantry';
import { CreatePantryIngredient, CreateExpDate, CreateMeasurement, Unit } from '../models/ingredient';
import { None, Some } from 'ts-results-es';
import { createNutritions } from '../models/nutritional_information';

describe('Pantry Module', () => {
    const mockNutrition = createNutritions(undefined, 52, 0.3, 0.2, 14);

    describe('createPantry', () => {
        it('should create an empty pantry', () => {
            const pantry = createPantry();
            expect(pantry.ingredients.size).toBe(0);
        });

        it('should create a pantry with initial ingredients', () => {
            const ingredient1 = CreatePantryIngredient('1', None, '123', None, mockNutrition, None);
            const ingredient2 = CreatePantryIngredient('2', None, '456', None, mockNutrition, None);
            const pantry = createPantry([ingredient1, ingredient2]);
            expect(pantry.ingredients.size).toBe(2);
            expect(pantry.ingredients.get('1')).toEqual(ingredient1);
            expect(pantry.ingredients.get('2')).toEqual(ingredient2);
        });
    });

    describe('addIngredient', () => {
        it('should add an ingredient to the pantry', () => {
            const pantry = createPantry();
            const ingredient = CreatePantryIngredient('1', None, '123', None, mockNutrition, None);
            addIngredient(pantry, ingredient);
            expect(pantry.ingredients.size).toBe(1);
            expect(pantry.ingredients.get('1')).toEqual(ingredient);
        });

        it('should overwrite an existing ingredient with the same ID', () => {
            const ingredient1 = CreatePantryIngredient('1', None, '123', None, mockNutrition, None);
            const pantry = createPantry([ingredient1]);
            const ingredient2 = CreatePantryIngredient('1', Some('BrandX'), '456', None, mockNutrition, None);
            addIngredient(pantry, ingredient2);
            expect(pantry.ingredients.size).toBe(1);
            expect(pantry.ingredients.get('1')).toEqual(ingredient2);
        });
    });

    describe('removeIngredient', () => {
        it('should remove an ingredient from the pantry', () => {
            const ingredient1 = CreatePantryIngredient('1', None, '123', None, mockNutrition, None);
            const pantry = createPantry([ingredient1]);
            const result = removeIngredient(pantry, '1');
            expect(pantry.ingredients.size).toBe(0);
            expect(result.isOk()).toBe(true);
        });

        it('should return an error if the ingredient does not exist', () => {
            const pantry = createPantry();
            const result = removeIngredient(pantry, '1');
            expect(pantry.ingredients.size).toBe(0);
            expect(result.isOk()).toBe(false);
        });
    });

    describe('getExpiredIngredients', () => {
        it('should yield expired ingredients', () => {
            const ingredient1 = CreatePantryIngredient('1', None, '123', None, mockNutrition, Some(CreateExpDate(2023, 0, 1)));
            const ingredient2 = CreatePantryIngredient('2', None, '456', None, mockNutrition, None);
            const ingredient3 = CreatePantryIngredient('3', None, '789', None, mockNutrition, Some(CreateExpDate(2024, 11, 31)));
            const pantry = createPantry([ingredient1, ingredient2, ingredient3]);

            const expiredIngredients = Array.from(getExpiredIngredients(pantry));
            expect(expiredIngredients.length).toBe(2);
            expect(expiredIngredients[0]).toEqual(ingredient1);
            expect(expiredIngredients[1]).toEqual(ingredient3);
        });

        it('should yield no expired ingredients when pantry is empty', () => {
            const pantry: Pantry = createPantry();
            const expiredIngredients = Array.from(getExpiredIngredients(pantry));
            expect(expiredIngredients.length).toBe(0);
        });

        it('should yield no expired ingredients when all ingredients are not expired', () => {
            const currentDate = new Date();
            const futureDate = new Date(currentDate.setDate(currentDate.getDate() + 3));
            const exp_date = CreateExpDate(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate());

            const ingredient1 = CreatePantryIngredient('1', None, '123', None, mockNutrition, Some(exp_date));
            const ingredient2 = CreatePantryIngredient('2', None, '456', None, mockNutrition, Some(exp_date));
            const pantry = createPantry([ingredient1, ingredient2]);

            const expiredIngredients = Array.from(getExpiredIngredients(pantry));
            expect(expiredIngredients.length).toBe(0);
        });

        it('should use a custom date for expiration check', () => {
            const ingredient1 = CreatePantryIngredient('1', None, '123', None, mockNutrition, Some(CreateExpDate(2023, 11, 31)));
            const ingredient2 = CreatePantryIngredient('2', None, '456', None, mockNutrition, Some(CreateExpDate(2024, 0, 1)));
            const pantry = createPantry([ingredient1, ingredient2]);

            // Set custom date to 2023-12-31
            const customDate = CreateExpDate(2023, 11, 31);
            const expiredIngredients = Array.from(getExpiredIngredients(pantry, customDate));
            expect(expiredIngredients.length).toBe(1);
            expect(expiredIngredients[0]).toEqual(ingredient1);
        });
    });
});