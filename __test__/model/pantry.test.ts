import { PantryDTO, createPantryDto } from '../../models/pantry';
import { createPantryIngredient, createExpDate, createMeasurement, Unit, DbPantryIngredient, ExpDate } from '../../models/ingredient';
import { None, Some, Result, Ok, Err, Option } from 'ts-results-es';
import { createNutrition } from '../../models/nutritional_information'; // Corrected import

// Helper functions to operate on PantryDTO
const addIngredientToDTO = (pantryDto: PantryDTO, ingredient: DbPantryIngredient): PantryDTO => {
    const ingredients = [...pantryDto.ingredients];
    const existingIndex = ingredients.findIndex(i => i.id === ingredient.id);
    if (existingIndex > -1) {
        ingredients[existingIndex] = ingredient; // Overwrite existing
    } else {
        ingredients.push(ingredient); // Add new
    }
    return { ...pantryDto, ingredients };
};

const removeIngredientFromDTO = (pantryDto: PantryDTO, ingredientId: string): Result<PantryDTO, Error> => {
    const initialLength = pantryDto.ingredients.length;
    const ingredients = pantryDto.ingredients.filter(i => i.id !== ingredientId);
    if (ingredients.length === initialLength) {
        return Err(new Error('Ingredient not found'));
    }
    return Ok({ ...pantryDto, ingredients });
};

const getExpiredIngredientsFromDTO = (pantryDto: PantryDTO, date: ExpDate = createExpDate()): DbPantryIngredient[] => {
    return pantryDto.ingredients.filter(ing =>
        ing.expiration_date.isSome() &&
        ing.expiration_date.unwrap() <= date
    );
};

describe('Pantry Module', () => {
    const mockNutrition = createNutrition(undefined, 52, 0.3, 0.2, 14);
    const testUserId = "userTest123";

    // Helper to create DbPantryIngredient for tests
    const createTestDbPantryIngredient = (
        id: string,
        type: string,
        brand: Option<string>,
        quantity: Option<ReturnType<typeof createMeasurement>>,
        nutrition: Option<ReturnType<typeof createNutrition>>,
        expiration_date: Option<ExpDate>
    ): DbPantryIngredient => {
        const pantryIngredient = createPantryIngredient(type, brand.isSome() ? brand.unwrap() : undefined, quantity.isSome() ? quantity.unwrap() : undefined, nutrition.isSome() ? nutrition.unwrap() : undefined, expiration_date.isSome() ? expiration_date.unwrap() : undefined);
        return { ...pantryIngredient, id };
    };

    describe('createPantryDto', () => {
        it('should create an empty pantry DTO', () => {
            const pantry = createPantryDto(testUserId, []);
            expect(pantry.userId).toBe(testUserId);
            expect(pantry.ingredients.length).toBe(0);
        });

        it('should create a pantry DTO with initial ingredients', () => {
            const ingredient1 = createTestDbPantryIngredient('1', 'type1', None, Some(createMeasurement(100, Unit.G)), Some(mockNutrition), None);
            const ingredient2 = createTestDbPantryIngredient('2', 'type2', None, Some(createMeasurement(200, Unit.ML)), Some(mockNutrition), None);
            const pantry = createPantryDto(testUserId, [ingredient1, ingredient2]);
            expect(pantry.ingredients.length).toBe(2);
            expect(pantry.ingredients.find(i => i.id === '1')).toEqual(ingredient1);
            expect(pantry.ingredients.find(i => i.id === '2')).toEqual(ingredient2);
        });
    });

    describe('addIngredientToDTO', () => {
        it('should add an ingredient to the pantry DTO', () => {
            let pantry = createPantryDto(testUserId, []);
            const ingredient = createTestDbPantryIngredient('1', 'type1', None, Some(createMeasurement(100, Unit.G)), Some(mockNutrition), None);
            pantry = addIngredientToDTO(pantry, ingredient);
            expect(pantry.ingredients.length).toBe(1);
            expect(pantry.ingredients.find(i => i.id === '1')).toEqual(ingredient);
        });

        it('should overwrite an existing ingredient with the same ID in pantry DTO', () => {
            const ingredient1 = createTestDbPantryIngredient('1', 'type1', None, Some(createMeasurement(100, Unit.G)), Some(mockNutrition), None);
            let pantry = createPantryDto(testUserId, [ingredient1]);
            const ingredient2 = createTestDbPantryIngredient('1', 'type1Updated', Some('BrandX'), Some(createMeasurement(150, Unit.G)), Some(mockNutrition), None);
            pantry = addIngredientToDTO(pantry, ingredient2);
            expect(pantry.ingredients.length).toBe(1);
            expect(pantry.ingredients.find(i => i.id === '1')).toEqual(ingredient2);
        });
    });

    describe('removeIngredientFromDTO', () => {
        it('should remove an ingredient from the pantry DTO', () => {
            const ingredient1 = createTestDbPantryIngredient('1', 'type1', None, Some(createMeasurement(100, Unit.G)), Some(mockNutrition), None);
            let pantry = createPantryDto(testUserId, [ingredient1]);
            const result = removeIngredientFromDTO(pantry, '1');
            expect(result.isOk()).toBe(true);
            if (result.isOk()) {
                pantry = result.unwrap();
            }
            expect(pantry.ingredients.length).toBe(0);
        });

        it('should return an error if the ingredient does not exist in pantry DTO', () => {
            let pantry = createPantryDto(testUserId, []);
            const result = removeIngredientFromDTO(pantry, '1');
            expect(result.isOk()).toBe(false);
            expect(pantry.ingredients.length).toBe(0);
        });
    });

    describe('getExpiredIngredientsFromDTO', () => {
        it('should yield expired ingredients from pantry DTO', () => {
            const ingredient1 = createTestDbPantryIngredient('1', 'type1', None, None, Some(mockNutrition), Some(createExpDate(2023, 0, 1))); // Expired
            const ingredient2 = createTestDbPantryIngredient('2', 'type2', None, None, Some(mockNutrition), None); // No expiry date
            const ingredient3 = createTestDbPantryIngredient('3', 'type3', None, None, Some(mockNutrition), Some(createExpDate(new Date().getFullYear() + 1, 11, 31))); // Not expired
            const pantry = createPantryDto(testUserId, [ingredient1, ingredient2, ingredient3]);

            // Assuming current date makes ingredient1 expired and ingredient3 not.
            const customCheckDate = createExpDate(2023, 6, 1); // June 1st, 2023
            const expiredIngredients = getExpiredIngredientsFromDTO(pantry, customCheckDate);
            expect(expiredIngredients.length).toBe(1);
            expect(expiredIngredients[0]).toEqual(ingredient1);
        });

        it('should yield no expired ingredients when pantry DTO is empty', () => {
            const pantry: PantryDTO = createPantryDto(testUserId, []);
            const expiredIngredients = getExpiredIngredientsFromDTO(pantry);
            expect(expiredIngredients.length).toBe(0);
        });

        it('should yield no expired ingredients when all ingredients in pantry DTO are not expired', () => {
            const currentDate = new Date();
            const futureDate = new Date(currentDate.setDate(currentDate.getDate() + 3)); // 3 days in future
            const exp_date = createExpDate(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate());

            const ingredient1 = createTestDbPantryIngredient('1', 'type1', None, None, Some(mockNutrition), Some(exp_date));
            const ingredient2 = createTestDbPantryIngredient('2', 'type2', None, None, Some(mockNutrition), Some(exp_date));
            const pantry = createPantryDto(testUserId, [ingredient1, ingredient2]);

            const expiredIngredients = getExpiredIngredientsFromDTO(pantry);
            expect(expiredIngredients.length).toBe(0);
        });

        it('should use a custom date for expiration check in pantry DTO', () => {
            const ingredient1 = createTestDbPantryIngredient('1', 'type1', None, None, Some(mockNutrition), Some(createExpDate(2023, 11, 30))); // Nov 30, 2023
            const ingredient2 = createTestDbPantryIngredient('2', 'type2', None, None, Some(mockNutrition), Some(createExpDate(2024, 0, 1)));    // Jan 1, 2024
            const pantry = createPantryDto(testUserId, [ingredient1, ingredient2]);

            const customDate = createExpDate(2023, 11, 31); // Check date: Dec 31, 2023
            const expiredIngredients = getExpiredIngredientsFromDTO(pantry, customDate);
            expect(expiredIngredients.length).toBe(1);
            expect(expiredIngredients[0]).toEqual(ingredient1);
        });
    });
});