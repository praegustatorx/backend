import { createDiet, Diet, Allergy } from '../models/preferences';
import { Blacklist, CreateBlacklist, addToBlacklist, removeFromBlacklist, isBlacklisted } from '../models/preferences';

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

    describe('Blacklist Model', () => {
        let blacklist: Blacklist;

        beforeEach(() => {
            blacklist = CreateBlacklist();
        });

        it('should create an empty blacklist', () => {
            expect(blacklist.items).toEqual([]);
        });

        it('should add an ingredient to the blacklist', () => {
            const ingredient = { id: '1', name: 'Ingredient 1' };
            const updatedBlacklist = addToBlacklist(blacklist, ingredient);
            expect(updatedBlacklist.items).toContain(ingredient);
        });

        it('should not add duplicate ingredients to the blacklist', () => {
            const ingredient = { id: '1', name: 'Ingredient 1' };
            blacklist = addToBlacklist(blacklist, ingredient);
            blacklist = addToBlacklist(blacklist, ingredient);
            expect(blacklist.items.filter(item => item.id === '1').length).toBe(1);
        });

        it('should remove an ingredient from the blacklist', () => {
            const ingredient1 = { id: '1', name: 'Ingredient 1' };
            const ingredient2 = { id: '2', name: 'Ingredient 2' };
            blacklist = addToBlacklist(blacklist, ingredient1);
            blacklist = addToBlacklist(blacklist, ingredient2);
            const updatedBlacklist = removeFromBlacklist(blacklist, '1');
            expect(updatedBlacklist.items).not.toContain(ingredient1);
            expect(updatedBlacklist.items).toContain(ingredient2);
        });

        it('should check if an ingredient is blacklisted', () => {
            const ingredient = { id: '1', name: 'Ingredient 1' };
            blacklist = addToBlacklist(blacklist, ingredient);
            expect(isBlacklisted(blacklist, '1')).toBe(true);
            expect(isBlacklisted(blacklist, '2')).toBe(false);
        });
    });
});