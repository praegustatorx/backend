import {
  createDiet,
  Allergy,
  Preferences,
  createPreferences,
  addToBlacklist,
  removeFromBlacklist,
  isBlacklisted,
  addAllergy,
  removeAllergy,
  hasAllergy,
  getAllergies,
  addDiet,
  removeDietByName,
  hasDiet,
  getDiets
} from '../../models/preferences';

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
      expect(result.unwrapErr().length).toBe(2);
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

  describe('Allergies Functions', () => {
    let preferences: Preferences;

    beforeEach(() => {
      preferences = createPreferences();
    });

    test('should add an allergy to preferences', () => {
      addAllergy(preferences, Allergy.Nuts);
      expect(hasAllergy(preferences, Allergy.Nuts)).toBe(true);
    });

    test('should remove an allergy from preferences', () => {
      addAllergy(preferences, Allergy.Nuts);
      const result = removeAllergy(preferences, Allergy.Nuts);
      expect(result.isOk()).toBe(true);
      expect(hasAllergy(preferences, Allergy.Nuts)).toBe(false);
    });

    test('should return error when removing allergy from empty preferences', () => {
      const result = removeAllergy(preferences, Allergy.Nuts);
      expect(result.isOk()).toBe(false);
      expect(result.unwrapErr().message).toContain('Allergy not found in preferences.');
    });

    test('should get all allergies from preferences', () => {
      addAllergy(preferences, Allergy.Nuts);
      addAllergy(preferences, Allergy.Dairy);
      const allergies = getAllergies(preferences);
      expect(allergies).toContain(Allergy.Nuts);
      expect(allergies).toContain(Allergy.Dairy);
      expect(allergies.length).toBe(2);
    });
  });

  describe('Diet Functions', () => {
    let preferences: Preferences;
    let veganDiet: { name: string, description: string };
    let ketoDiet: { name: string, description: string };

    beforeEach(() => {
      preferences = createPreferences();
      veganDiet = { name: 'Vegan', description: 'Plant-based diet' };
      ketoDiet = { name: 'Keto', description: 'Low-carb diet' };
    });

    test('should add a diet to preferences', () => {
      addDiet(preferences, veganDiet);
      expect(hasDiet(preferences, 'Vegan')).toBe(true);
    });

    test('should remove a diet from preferences', () => {
      addDiet(preferences, veganDiet);
      const result = removeDietByName(preferences, 'Vegan');
      expect(result.isOk()).toBe(true);
      expect(hasDiet(preferences, 'Vegan')).toBe(false);
    });

    test('should return error when removing diet from empty preferences', () => {
      const result = removeDietByName(preferences, 'Vegan');
      expect(result.isOk()).toBe(false);
      expect(result.unwrapErr().message).toContain('Diet not found in preferences.');
    });

    test('should get all diets from preferences', () => {
      addDiet(preferences, veganDiet);
      addDiet(preferences, ketoDiet);
      const diets = getDiets(preferences);
      expect(diets).toContainEqual(veganDiet);
      expect(diets).toContainEqual(ketoDiet);
      expect(diets.length).toBe(2);
    });
  });

  describe('Blacklist Functions', () => {
    let preferences: Preferences;
    const ingredient1 = 'tomato-123';
    const ingredient2 = 'onion-456';

    beforeEach(() => {
      preferences = createPreferences();
    });

    test('should add an ingredient to the blacklist', () => {
      addToBlacklist(preferences, ingredient1);
      expect(isBlacklisted(preferences, ingredient1)).toBe(true);
    });

    test('should not add duplicate ingredients to the blacklist', () => {
      addToBlacklist(preferences, ingredient1);
      addToBlacklist(preferences, ingredient1);

      // Check there's only one instance
      expect(preferences.blacklist.size).toBe(1);
    });

    test('should remove an ingredient from the blacklist', () => {
      addToBlacklist(preferences, ingredient1);
      addToBlacklist(preferences, ingredient2);

      const result = removeFromBlacklist(preferences, ingredient1);

      expect(result.isOk()).toBe(true);
      expect(isBlacklisted(preferences, ingredient1)).toBe(false);
      expect(isBlacklisted(preferences, ingredient2)).toBe(true);
    });

    test('should return error when removing from empty blacklist', () => {
      const result = removeFromBlacklist(preferences, ingredient1);
      expect(result.isOk()).toBe(false);
      expect(result.unwrapErr().message).toContain('Blacklist is empty.');
    });

    test('should return error when removing non-existent ingredient', () => {
      addToBlacklist(preferences, ingredient1);
      const result = removeFromBlacklist(preferences, 'nonexistent-789');
      expect(result.isOk()).toBe(false);
      expect(result.unwrapErr().message).toContain('Ingredient not found in blacklist.');
    });

    test('should check if an ingredient is blacklisted', () => {
      addToBlacklist(preferences, ingredient1);
      expect(isBlacklisted(preferences, ingredient1)).toBe(true);
      expect(isBlacklisted(preferences, ingredient2)).toBe(false);
    });
  });

  describe('createPreferences function', () => {
    test('should create preferences with default empty values', () => {
      const preferences = createPreferences();
      expect(preferences.allergies.size).toBe(0);
      expect(preferences.diets.size).toBe(0);
      expect(preferences.blacklist.size).toBe(0);
    });

    test('should create preferences with provided values', () => {
      const allergies = new Set([Allergy.Nuts]);
      const diet = createDiet('Vegan', 'Plant-based diet').unwrap();
      const diets = new Set([diet]);
      const blacklist = new Set(['tomato-123', 'onion-456']);

      const preferences = createPreferences(allergies, diets, blacklist);

      expect(preferences.allergies).toEqual(allergies);
      expect(preferences.diets).toEqual(diets);
      expect(preferences.blacklist).toEqual(blacklist);
    });
  });
});