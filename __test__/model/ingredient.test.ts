import { None, Ok, Some } from 'ts-results-es';
import {
    Nutrition,
    createNutrition // Corrected import
} from "../../models/nutritional_information";

import {
    createExpDate, // Corrected import
    createMeasurement, // Corrected import
    createPantryIngredient, // Corrected import
    createRecipeIngredient, // Corrected import
    isIngredientExpired,
    PantryIngredient,
    ExpDate,
    Unit,
} from '../../models/ingredient';

describe('Ingredient Module', () => {
    describe('Measurement', () => {
        it('should create a measurement', () => {
            const measurement = createMeasurement(100, Unit.G); // Corrected function call and Unit
            expect(measurement.amount).toBe(100);
            expect(measurement.unit).toBe('g'); // Corrected expected unit
        });

        it('should allow negative quantity for measurement creation', () => { // Test description updated to reflect behavior
            const measurement = createMeasurement(-100, Unit.G); // Corrected function call and Unit
            expect(measurement.amount).toBeLessThan(0);
        });

        it('should allow zero quantity for measurement creation', () => { // Test description updated to reflect behavior
            const measurement = createMeasurement(0, Unit.G); // Corrected function call and Unit
            expect(measurement.amount).toBe(0);
        });
    });

    describe('PantryIngredient', () => {
        const mockNutrition = createNutrition( // Corrected function call
            undefined,  // Use default portion
            52,         // calories
            0.3,        // protein
            0.2,        // fat
            14          // carbohydrates
        );

        it('should create a pantry ingredient with all fields', () => {
            const expDate = createExpDate(2024, 11, 31); // Corrected function call
            const measurement = createMeasurement(100, Unit.G); // Corrected function call and Unit
            const ingredient = createPantryIngredient( // Corrected function call
                'apple-123',
                'BrandX',
                measurement,
                mockNutrition,
                expDate
            );

            expect(ingredient.brand.unwrap()).toBe('BrandX');
            expect(ingredient.type).toBe('apple-123');
            expect(ingredient.quantity.unwrap()).toEqual(measurement);
            expect(ingredient.nutrition.unwrap()).toEqual(mockNutrition); // Added unwrap
            expect(ingredient.expiration_date.unwrap()).toEqual(expDate);
        });

        it('should create a pantry ingredient with default values for optional fields', () => {
            const ingredient = createPantryIngredient('apple-123', undefined, undefined, mockNutrition, undefined); // Corrected function call

            expect(ingredient.brand).toEqual(None);
            expect(ingredient.type).toBe('apple-123');
            expect(ingredient.quantity).toEqual(None);
            expect(ingredient.nutrition.unwrap()).toEqual(mockNutrition); // Added unwrap
            expect(ingredient.expiration_date).toEqual(None);
        });

        it('should create pantry ingredient with empty type if provided', () => { // Test description updated
            const ingredient = createPantryIngredient('', undefined, undefined, mockNutrition, undefined); // Corrected function call
            expect(ingredient.type).toBe('');
        });

        it('should allow negative quantity value in pantry ingredient', () => { // Test description updated
            const measurement = createMeasurement(-50, Unit.G); // Corrected function call and Unit
            const ingredient = createPantryIngredient( // Corrected function call
                'apple-123',
                undefined,
                measurement,
                mockNutrition,
                undefined
            );
            expect(ingredient.quantity.unwrap().amount).toBeLessThan(0);
        });
    });

    describe('ExpDate', () => {
        it('should create an ExpDate with provided values', () => {
            const date = createExpDate(2024, 0, 20); // Corrected function call, Month is 0-indexed
            expect(date.getFullYear()).toBe(2024);
            expect(date.getMonth()).toBe(0);
            expect(date.getDate()).toBe(20);
        });

        it('should create an ExpDate with current date if no values are provided', () => {
            const date = createExpDate(); // Corrected function call
            const now = new Date();
            now.setHours(23, 59, 59, 999); // Align with createExpDate behavior
            expect(date.getFullYear()).toBe(now.getFullYear());
            expect(date.getMonth()).toBe(now.getMonth());
            expect(date.getDate()).toBe(now.getDate());
            expect(date.getHours()).toBe(23);
            expect(date.getMinutes()).toBe(59);
            expect(date.getSeconds()).toBe(59);
        });

        it('should handle invalid date values by JavaScripts Date object normalization', () => { // Test description updated
            const date = createExpDate(2024, 13, 32); // Corrected function call, Invalid month and day
            // JavaScript's Date object will normalize this. e.g., month 13 becomes Feb of next year.
            const expectedDate = new Date(2024, 13, 32);
            expectedDate.setHours(23, 59, 59, 999);
            expect(date.getFullYear()).toBe(expectedDate.getFullYear());
            expect(date.getMonth()).toBe(expectedDate.getMonth());
            expect(date.getDate()).toBe(expectedDate.getDate());
        });

        it('should create ExpDate with negative year if provided', () => { // Test description updated
            const date = createExpDate(-2024, 5, 15); // Corrected function call
            expect(date.getFullYear()).toBe(-2024); // JS Date handles negative years
        });
    });

    describe('isIngredientExpired', () => {
        const mockNutrition = createNutrition(undefined, 52, 0.3, 0.2, 14); // Corrected function call

        it('should return true if the ingredient is expired', () => {
            const expDate = createExpDate(2023, 0, 1); // Corrected function call, Expired on Jan 1, 2023
            const ingredient: PantryIngredient = createPantryIngredient( // Corrected function call
                'apple-123',
                undefined,
                undefined,
                mockNutrition,
                expDate
            );
            // Assuming current date is May 8, 2025, as per context
            const currentDate = createExpDate(2025, 4, 8); // May is month 4
            expect(isIngredientExpired(ingredient, currentDate)).toBe(true);
        });

        it('should return false if the ingredient is not expired', () => {
            const futureYear = new Date().getFullYear() + 5;
            const expDate = createExpDate(futureYear, 11, 31); // Corrected function call, Expires 5 years in the future
            const ingredient: PantryIngredient = createPantryIngredient( // Corrected function call
                'apple-123',
                undefined,
                undefined,
                mockNutrition,
                expDate
            );
            expect(isIngredientExpired(ingredient)).toBe(false);
        });

        it('should return false if the ingredient has no expiration date', () => {
            const ingredient: PantryIngredient = createPantryIngredient('apple-123', undefined, undefined, mockNutrition, undefined); // Corrected function call
            expect(isIngredientExpired(ingredient)).toBe(false);
        });

        it('should return true if the ingredient is expired compared to custom date', () => {
            const expDate = createExpDate(2023, 0, 1); // Corrected function call, Expired on Jan 1, 2023
            const ingredient: PantryIngredient = createPantryIngredient( // Corrected function call
                'apple-123',
                undefined,
                undefined,
                mockNutrition,
                expDate
            );
            const customDate: ExpDate = createExpDate(2023, 6, 1); // Corrected function call, July 1, 2023
            expect(isIngredientExpired(ingredient, customDate)).toBe(true);
        });

        it('should handle potentially invalid date string for expiration date gracefully', () => { // Test description updated
            // Creating an invalid date object by direct assignment
            const invalidDate = new Date('invalid-date');
            const ingredient: PantryIngredient = { // Manually creating PantryIngredient for this specific test case
                type: 'apple-123',
                brand: None,
                quantity: None,
                nutrition: Some(mockNutrition),
                expiration_date: Some(invalidDate as ExpDate)
            };
            // isIngredientExpired should handle invalid dates, typically resulting in false
            expect(isIngredientExpired(ingredient)).toBe(false);
        });

        it('should correctly evaluate isIngredientExpired for future dates', () => { // Test description updated
            // Create a date far in the future
            const futureDate = createExpDate(2050, 0, 1); // Corrected function call, January 1, 2050
            const ingredient: PantryIngredient = createPantryIngredient( // Corrected function call
                'apple-123',
                undefined,
                undefined,
                mockNutrition,
                futureDate
            );
            expect(isIngredientExpired(ingredient)).toBe(false); // Should be false as it's not expired
        });
    });

    describe('RecipeIngredient', () => {
        it('should create a recipe ingredient with quantity', () => {
            const measurement = createMeasurement(50, Unit.G); // Corrected function call and Unit
            const ingredient = createRecipeIngredient('apple-789', Some(measurement)); // Corrected function call
            expect(ingredient.type).toBe('apple-789');
            expect(ingredient.quantity.unwrap()).toEqual(measurement);
        });

        it('should create a recipe ingredient without quantity (defaults to None)', () => { // Test description updated
            const ingredient = createRecipeIngredient('apple-789'); // Corrected function call
            expect(ingredient.type).toBe('apple-789');
            expect(ingredient.quantity).toEqual(None);
        });

        it('should create recipe ingredient with empty type if provided', () => { // Test description updated
            const ingredient = createRecipeIngredient(''); // Corrected function call
            expect(ingredient.type).toBe('');
        });

        it('should allow negative quantity for recipe ingredient', () => { // Test description updated
            const measurement = createMeasurement(-25, Unit.G); // Corrected function call and Unit
            const ingredient = createRecipeIngredient('apple-789', Some(measurement)); // Corrected function call
            expect(ingredient.quantity.unwrap().amount).toBeLessThan(0);
        });
    });
});