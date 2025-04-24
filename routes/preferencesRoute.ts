import express, { Request, Response } from 'express';
import {
    Preferences,
    Allergy,
    createDiet,
    addToBlacklist,
    removeFromBlacklist,
    addAllergy,
    removeAllergy,
    addDiet,
    removeDietByName,
    preferencesFromDTO,
    preferencesIntoDTO
} from '../models/preferences';
import { GenericIngredient } from '../models/ingredient';

const router = express.Router();

// Mock user preferences store (replace with actual database integration)
let userPreferences = new Map<string, Preferences>();

// GET test
router.get('/test', (req: Request, res: Response): void => {
    console.log('Hello World');
    res.status(200).end();
});

// GET user preferences
router.get('/:userId', (req: Request, res: Response) => {
    const userId = req.params.userId;

    // TODO: Fetch user preferences from the database
    const preferences = userPreferences.get(userId);

    preferences ? res.status(200).json(preferencesIntoDTO(preferences)) : res.status(404).json({ message: 'Preferences not found' });
});

// Create or update user preferences
router.post('/:userId', (req: Request, res: Response) => {
    const userId = req.params.userId;
    const { allergies, diets, blacklist } = req.body;

    const userPrefs = preferencesFromDTO({allergies, diets, blacklist});

    // TODO: Persist user preferences to the database
    userPreferences.set(userId, userPrefs);
    res.status(201).end();
});

// Add allergy to user preferences
router.post('/:userId/allergies', (req: Request, res: Response) => {
    const userId = req.params.userId;
    const { allergy } = req.body;

    if (!Object.values(Allergy).includes(allergy)) {
        res.status(400).json({ message: 'Invalid allergy type' });
    }

    // TODO: Fetch from database
    const preferences = userPreferences.get(userId);
    if (!preferences) {
        res.status(404).json({ message: 'Preferences not found' });
    } else {
        addAllergy(preferences, allergy);
        // TODO: persist in database
        userPreferences.set(userId, preferences);
        res.status(200).end();
    }
});

// Remove allergy from user preferences
router.delete('/:userId/allergies/:allergy', (req: Request, res: Response) => {
    const userId = req.params.userId;
    const allergy = req.params.allergy as Allergy;

    const preferences = userPreferences.get(userId);
    if (!preferences) {
        res.status(404).json({ message: 'Preferences not found' });
    } else {
        const allergyRemoved = removeAllergy(preferences, allergy);
        if (allergyRemoved.isOk()) {
            // TODO persist
            userPreferences.set(userId, preferences);

            res.status(200).end();
        } else {
            res.status(400).json({ message: allergyRemoved.unwrapErr().message });
        }
    }
});

// Add diet to user preferences
router.post('/:userId/diets', (req: Request, res: Response) => {
    const userId = req.params.userId;
    const { name, description } = req.body;

    const dietResult = createDiet(name, description);
    if (dietResult.isErr()) {
        res.status(400).json({ errors: dietResult.unwrapErr() });
        return;
    }

    // TODO: Fetch from database
    const preferences = userPreferences.get(userId);
    if (!preferences) {
        res.status(404).json({ message: 'Preferences not found' });
        return;
    }

    addDiet(preferences, dietResult.unwrap());

    // TODO: persist in database
    userPreferences.set(userId, preferences);

    res.status(200).end();
});

// Remove diet from user preferences
router.delete('/:userId/diets/:dietName', (req: Request, res: Response) => {
    const userId = req.params.userId;
    const dietName = req.params.dietName;

    const preferences = userPreferences.get(userId);
    if (!preferences) {
        res.status(404).json({ message: 'Preferences not found' });
        return;
    }

    const dietRemoved = removeDietByName(preferences, dietName);
    if (dietRemoved.isErr()) {
        res.status(400).json({ message: dietRemoved.unwrapErr().message });
    } else {
        // TODO: persist in database
        userPreferences.set(userId, preferences);

        res.status(200).end();
    }
});

// Add ingredient to blacklist
router.post('/:userId/blacklist', (req: Request, res: Response) => {
    const userId = req.params.userId;
    const ingredient: GenericIngredient = req.body;

    if (!ingredient || !ingredient.id || !ingredient.name) {
        res.status(400).json({ message: 'Invalid ingredient' });
    }

    // TODO: Fetch from database
    const preferences = userPreferences.get(userId);
    if (!preferences) {
        res.status(404).json({ message: 'Preferences not found' });
        return;
    }

    addToBlacklist(preferences, ingredient);

    // TODO: persist in database
    userPreferences.set(userId, preferences);
    res.status(200).end();
});

// Remove ingredient from blacklist
router.delete('/:userId/blacklist/:ingredientId', (req: Request, res: Response) => {
    const userId = req.params.userId;
    const ingredientId = req.params.ingredientId;

    // TODO: Fetch from database
    const preferences = userPreferences.get(userId);
    if (!preferences) {
        res.status(404).json({ message: 'Preferences not found' });
        return;
    }

    const isRemoved = removeFromBlacklist(preferences, ingredientId);

    if (isRemoved.isErr()) {
        res.status(400).json({ message: isRemoved.unwrapErr().message });
    } else {
        // TODO: persist in database
        userPreferences.set(userId, preferences);
        res.status(200).end();
    }
});

export default router;
