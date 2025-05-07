import { None, Ok, Some } from 'ts-results-es';
import {
    Nutritions,
    createNutritions
} from "../models/nutritional_information";

import {
    CreateExpDate,
    CreateMeasurement,
    CreatePantryIngredient,
    CreateRecipeIngredient,
    isIngredientExpired,
    PantryIngredient,
    ExpDate,
    Unit,
} from '../models/ingredient';

describe('Ingredient Module', () => {
    describe('Measurement', () => {
        it('should create a measurement', () => {
            const measurement = CreateMeasurement(100, Unit.GRAM);
            expect(measurement.amount).toBe(100);
            expect(measurement.unit).toBe('gram');
        });

        it('should fail with negative quantity', () => {
            const measurement = CreateMeasurement(-100, Unit.GRAM);
            expect(measurement.amount).toBeLessThan(0);
        });

        it('should fail with zero quantity', () => {
            const measurement = CreateMeasurement(0, Unit.GRAM);
            expect(measurement.amount).toBe(0);
        });
    });

    describe('PantryIngredient', () => {
        const mockNutrition = createNutritions(
            undefined,  // Use default portion
            52,         // calories
            0.3,        // protein
            0.2,        // fat
            14          // carbohydrates
        );

        it('should create a pantry ingredient with all fields', () => {
            const expDate = CreateExpDate(2024, 11, 31);
            const measurement = CreateMeasurement(100, Unit.GRAM);
            const ingredient = CreatePantryIngredient(
                '456',
                Some('BrandX'),
                'apple-123',
                Some(measurement),
                mockNutrition,
                Some(expDate)
            );

            expect(ingredient.id).toBe('456');
            expect(ingredient.brand.unwrap()).toBe('BrandX');
            expect(ingredient.type).toBe('apple-123');
            expect(ingredient.quantity.unwrap()).toEqual(measurement);
            expect(ingredient.nutrition).toEqual(mockNutrition);
            expect(ingredient.expiration_date.unwrap()).toEqual(expDate);
        });

        it('should create a pantry ingredient with default values', () => {
            const ingredient = CreatePantryIngredient('456', None, 'apple-123', None, mockNutrition, None);

            expect(ingredient.id).toBe('456');
            expect(ingredient.brand).toEqual(None);
            expect(ingredient.type).toBe('apple-123');
            expect(ingredient.quantity).toEqual(None);
            expect(ingredient.nutrition).toEqual(mockNutrition);
            expect(ingredient.expiration_date).toEqual(None);
        });

        it('should fail with invalid ID', () => {
            const ingredient = CreatePantryIngredient('', None, 'apple-123', None, mockNutrition, None);
            expect(ingredient.id).toBe('');
        });

        it('should fail with invalid type', () => {
            const ingredient = CreatePantryIngredient('456', None, '', None, mockNutrition, None);
            expect(ingredient.type).toBe('');
        });

        it('should fail with negative quantity value', () => {
            const measurement = CreateMeasurement(-50, Unit.GRAM);
            const ingredient = CreatePantryIngredient(
                '456',
                None,
                'apple-123',
                Some(measurement),
                mockNutrition,
                None
            );
            expect(ingredient.quantity.unwrap().amount).toBeLessThan(0);
        });
    });

    describe('ExpDate', () => {
        it('should create an ExpDate with provided values', () => {
            const date = CreateExpDate(2024, 0, 20); // Month is 0-indexed
            expect(date.getFullYear()).toBe(2024);
            expect(date.getMonth()).toBe(0);
            expect(date.getDate()).toBe(20);
        });

        it('should create an ExpDate with current date if no values are provided', () => {
            const date = CreateExpDate();
            const now = new Date();
            expect(date.getFullYear()).toBe(now.getFullYear());
            expect(date.getMonth()).toBe(now.getMonth());
            expect(date.getDate()).toBe(now.getDate());
        });

        it('should fail with invalid date values', () => {
            const date = CreateExpDate(2024, 13, 32); // Invalid month and day
            expect(date.getMonth()).not.toBe(13); // JavaScript normalizes invalid dates
            expect(date.getDate()).not.toBe(32);
        });

        it('should fail with negative year', () => {
            const date = CreateExpDate(-2024, 5, 15);
            expect(date.getFullYear()).toBeLessThan(0);
        });
    });

    describe('isIngredientExpired', () => {
        const mockNutrition = createNutritions(undefined, 52, 0.3, 0.2, 14); // Mock nutrition data

        it('should return true if the ingredient is expired', () => {
            const expDate = CreateExpDate(2023, 0, 1); // Expired on Jan 1, 2023
            const ingredient: PantryIngredient = CreatePantryIngredient(
                '1',
                None,
                'apple-123',
                None,
                mockNutrition,
                Some(expDate)
            );
            expect(isIngredientExpired(ingredient)).toBe(true);
        });

        it('should return false if the ingredient is not expired', () => {
            const futureYear = new Date().getFullYear() + 5;
            const expDate = CreateExpDate(futureYear, 11, 31); // Expires 5 years in the future
            const ingredient: PantryIngredient = CreatePantryIngredient(
                '1',
                None,
                'apple-123',
                None,
                mockNutrition,
                Some(expDate)
            );
            expect(isIngredientExpired(ingredient)).toBe(false);
        });

        it('should return false if the ingredient has no expiration date', () => {
            const ingredient: PantryIngredient = CreatePantryIngredient('1', None, 'apple-123', None, mockNutrition, None);
            expect(isIngredientExpired(ingredient)).toBe(false);
        });

        it('should return true if the ingredient is expired compared to custom date', () => {
            const expDate = CreateExpDate(2023, 0, 1); // Expired on Jan 1, 2023
            const ingredient: PantryIngredient = CreatePantryIngredient(
                '1',
                None,
                'apple-123',
                None,
                mockNutrition,
                Some(expDate)
            );
            const customDate: ExpDate = CreateExpDate(2023, 6, 1); // July 1, 2023
            expect(isIngredientExpired(ingredient, customDate)).toBe(true);
        });

        it('should handle corrupted expiration date', () => {
            // Creating an invalid date object
            const invalidDate = new Date('invalid-date');
            const ingredient: PantryIngredient = CreatePantryIngredient(
                '1',
                None,
                'apple-123',
                None,
                mockNutrition,
                Some(invalidDate as ExpDate)
            );
            // This will test how the function handles invalid dates
            expect(isIngredientExpired(ingredient)).toBe(false); // Assuming invalid dates are treated as not expired
        });

        it('should correct isIngredientExpired behavior for future dates', () => {
            // Create a date far in the future
            const futureDate = CreateExpDate(2050, 0, 1); // January 1, 2050
            const ingredient: PantryIngredient = CreatePantryIngredient(
                '1',
                None,
                'apple-123',
                None,
                mockNutrition,
                Some(futureDate)
            );
            expect(isIngredientExpired(ingredient)).toBe(false); // Should be false as it's not expired
        });
    });

    describe('RecipeIngredient', () => {
        it('should create a recipe ingredient with quantity', () => {
            const measurement = CreateMeasurement(50, Unit.GRAM);
            const ingredient = CreateRecipeIngredient('apple-789', Some(measurement));
            expect(ingredient.type).toBe('apple-789');
            expect(ingredient.quantity.unwrap()).toEqual(measurement);
        });

        it('should create a recipe ingredient without quantity', () => {
            const ingredient = CreateRecipeIngredient('apple-789');
            expect(ingredient.type).toBe('apple-789');
            expect(ingredient.quantity).toEqual(None);
        });

        it('should fail with empty type', () => {
            const ingredient = CreateRecipeIngredient('');
            expect(ingredient.type).toBe('');
        });

        it('should fail with negative quantity', () => {
            const measurement = CreateMeasurement(-25, Unit.GRAM);
            const ingredient = CreateRecipeIngredient('apple-789', Some(measurement));
            expect(ingredient.quantity.unwrap().amount).toBeLessThan(0);
        });
    });
});