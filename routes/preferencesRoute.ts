import express, { Request, Response, NextFunction } from 'express';
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
import PreferencesModel, { toPreferences, fromPreferences } from '../database/preferencesSchema';

const router = express.Router();

// Error handling middleware
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// GET test
router.get('/test', (req: Request, res: Response): void => {
    console.log('Hello World');
    res.status(200).end();
});

// GET user preferences
router.get('/:userId', asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;

    const preferencesDoc = await PreferencesModel.findOne({ userId });
    if (!preferencesDoc) {
        return res.status(404).json({ message: 'Preferences not found' });
    }
    
    const preferences = toPreferences(preferencesDoc);
    res.status(200).json(preferencesIntoDTO(preferences));
}));

// Create or update user preferences
router.post('/:userId', asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const { allergies, diets, blacklist } = req.body;

    const userPrefs = preferencesFromDTO({allergies, diets, blacklist});

    await PreferencesModel.findOneAndUpdate(
        { userId }, 
        fromPreferences(userPrefs, userId),
        { upsert: true, new: true }
    );
    res.status(201).end();
}));

// Add allergy to user preferences
router.post('/:userId/allergies', asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const { allergy } = req.body;

    if (!Object.values(Allergy).includes(allergy)) {
        return res.status(400).json({ message: 'Invalid allergy type' });
    }

    const preferencesDoc = await PreferencesModel.findOne({ userId });
    if (!preferencesDoc) {
        return res.status(404).json({ message: 'Preferences not found' });
    }
    
    const preferences = toPreferences(preferencesDoc);
    addAllergy(preferences, allergy);
    
    await PreferencesModel.findOneAndUpdate(
        { userId },
        fromPreferences(preferences, userId)
    );
    res.status(200).end();
}));

// Remove allergy from user preferences
router.delete('/:userId/allergies/:allergy', asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const allergy = req.params.allergy as Allergy;

    const preferencesDoc = await PreferencesModel.findOne({ userId });
    if (!preferencesDoc) {
        return res.status(404).json({ message: 'Preferences not found' });
    }
    
    const preferences = toPreferences(preferencesDoc);
    const allergyRemoved = removeAllergy(preferences, allergy);
    
    if (allergyRemoved.isOk()) {
        await PreferencesModel.findOneAndUpdate(
            { userId },
            fromPreferences(preferences, userId)
        );
        res.status(200).end();
    } else {
        res.status(400).json({ message: allergyRemoved.unwrapErr().message });
    }
}));

// Add diet to user preferences
router.post('/:userId/diets', asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const { name, description } = req.body;

    const dietResult = createDiet(name, description);
    if (dietResult.isErr()) {
        return res.status(400).json({ errors: dietResult.unwrapErr() });
    }

    const preferencesDoc = await PreferencesModel.findOne({ userId });
    if (!preferencesDoc) {
        return res.status(404).json({ message: 'Preferences not found' });
    }
    
    const preferences = toPreferences(preferencesDoc);
    addDiet(preferences, dietResult.unwrap());
    
    await PreferencesModel.findOneAndUpdate(
        { userId },
        fromPreferences(preferences, userId)
    );
    res.status(200).end();
}));

// Remove diet from user preferences
router.delete('/:userId/diets/:dietName', asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const dietName = req.params.dietName;

    const preferencesDoc = await PreferencesModel.findOne({ userId });
    if (!preferencesDoc) {
        return res.status(404).json({ message: 'Preferences not found' });
    }
    
    const preferences = toPreferences(preferencesDoc);
    const dietRemoved = removeDietByName(preferences, dietName);
    
    if (dietRemoved.isErr()) {
        return res.status(400).json({ message: dietRemoved.unwrapErr().message });
    }
    
    await PreferencesModel.findOneAndUpdate(
        { userId },
        fromPreferences(preferences, userId)
    );
    res.status(200).end();
}));

// Add ingredient to blacklist
router.post('/:userId/blacklist', asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const ingredient: GenericIngredient = req.body;

    if (!ingredient || !ingredient.id || !ingredient.name) {
        return res.status(400).json({ message: 'Invalid ingredient' });
    }

    const preferencesDoc = await PreferencesModel.findOne({ userId });
    if (!preferencesDoc) {
        return res.status(404).json({ message: 'Preferences not found' });
    }
    
    const preferences = toPreferences(preferencesDoc);
    addToBlacklist(preferences, ingredient);
    
    await PreferencesModel.findOneAndUpdate(
        { userId },
        fromPreferences(preferences, userId)
    );
    res.status(200).end();
}));

// Remove ingredient from blacklist
router.delete('/:userId/blacklist/:ingredientId', asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const ingredientId = req.params.ingredientId;

    const preferencesDoc = await PreferencesModel.findOne({ userId });
    if (!preferencesDoc) {
        return res.status(404).json({ message: 'Preferences not found' });
    }
    
    const preferences = toPreferences(preferencesDoc);
    const isRemoved = removeFromBlacklist(preferences, ingredientId);
    
    if (isRemoved.isErr()) {
        return res.status(400).json({ message: isRemoved.unwrapErr().message });
    }
    
    await PreferencesModel.findOneAndUpdate(
        { userId },
        fromPreferences(preferences, userId)
    );
    res.status(200).end();
}));

export default router;
