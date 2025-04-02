import { createDiet, Diet, Allergy } from '../models/preferences';
import { Ok, Err } from 'ts-results-es';

describe('Preferences Model', () => {
    describe('createDiet function', () => {
        test('should create a valid diet when provided valid inputs', () => {
            const name = 'Vegan';
            const description = 'Plant-based diet excluding all animal products';

            const result = createDiet(name, description);

            expect(result.isOk()).toBe(true);
            expect(result.unwrap()).toEqual({ name, description });
        });

        test('should return error when name is missing', () => {
            const name = '';
            const description = 'Valid description';

            const result = createDiet(name, description);

            expect(result.isOk()).toBe(false);
            expect(result.unwrapErr()).toContain('Diet name is required.');
        });

        test('should return error when description is missing', () => {
            const name = 'Valid name';
            const description = '';

            const result = createDiet(name, description);

            expect(result.isOk()).toBe(false);
            expect(result.unwrapErr()).toContain('Diet description is required.');
        });

        test('should return multiple errors when both name and description are missing', () => {
            const name = '';
            const description = '';

            const result = createDiet(name, description);

            expect(result.isOk()).toBe(false);
            expect(result.unwrapErr()).toContain('Diet name is required.');
            expect(result.unwrapErr()).toContain('Diet description is required.');
            // expect(result.unwrap().length).toBe(2);
        });
    });

    describe('Allergy enum', () => {
        test('should contain all expected allergy types', () => {
            expect(Allergy.Nuts).toBe('Nuts');
            expect(Allergy.Dairy).toBe('Dairy');
            expect(Allergy.Gluten).toBe('Gluten');
            expect(Allergy.Soy).toBe('Soy');
            expect(Allergy.Shellfish).toBe('Shellfish');
            expect(Allergy.Eggs).toBe('Eggs');
            expect(Allergy.Fish).toBe('Fish');
            expect(Allergy.Sesame).toBe('Sesame');
            expect(Allergy.Other).toBe('Other');
        });
    });
});
