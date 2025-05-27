import express, { Request, Response } from 'express';
import pantryDAO from '../dao/pantry.dao';
import { createPantryIngredient, PantryIngredient, parseExpDate } from '../models/ingredient';
import { createNutrition } from '../models/nutritional_information';

const router = express.Router();

// GET test
router.get('/test', (_req: Request, res: Response) => {
    console.log('Hello World');
    res.status(200).end();
});

// GET user's pantry
router.get('/:userId', (async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const result = await pantryDAO.getPantryByUserId(userId);

        result.isOk()
            ? res.status(200).json({
                userId: result.unwrap().userId,
                ingredients: result.unwrap().ingredients
            })
            : res.status(404).json({ message: result.unwrapErr().message });
    } catch (error) {
        console.error('Error getting user pantry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// GET expired ingredients
router.get('/:userId/expired', (async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { date } = req.query;

        let expirationDate = parseExpDate(date ? date.toString() : undefined); // Parse the date from query string

        if (!expirationDate) {
            res.status(400).json({ message: 'Invalid date format' });
            return;
        }
        const result = await pantryDAO.getExpiredIngredients(userId, expirationDate.unwrap());

        result.isOk()
            ? res.status(200).json({ expiredIngredients: result.unwrap() })
            : res.status(500).json({ message: result.unwrapErr().message });
    } catch (error) {
        console.error('Error getting expired ingredients:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

// PUT add ingredient to pantry
router.put('/:userId/ingredients', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { type } = req.body;

        if (!type) {
            res.status(400).json({ message: 'Ingredient name is required' });
            return;
        }

        const ingredient = parseIngredient(req);

        const result = await pantryDAO.addIngredientToPantry(userId, ingredient);

        result.isOk()
            ? res.status(200).json(result.unwrap())
            : res.status(400).json({ message: result.unwrapErr().message });
    } catch (error) {
        console.error('Error adding ingredient to pantry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE remove ingredient from pantry
router.delete('/:userId/ingredients/:ingredientId', (async (req: Request, res: Response) => {
    try {
        const { userId, ingredientId } = req.params;

        if (!ingredientId) {
            res.status(400).json({ message: 'Ingredient ID is required' });
        }

        const result = await pantryDAO.removeIngredientFromPantry(userId, ingredientId);

        result.isOk()
            ? res.status(204).end()
            : res.status(400).json({ message: result.unwrapErr().message });
    } catch (error) {
        console.error('Error removing ingredient from pantry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));

export default router;

const parseIngredient = (req: Request): PantryIngredient => {
    const { type, brand, quantity, nutrition, expiryDate } = req.body;

    const expDate = parseExpDate(expiryDate ? expiryDate.toString() : undefined); // Parse the date from query string
    if (!expDate) {
        throw new Error('Invalid date format');
    }

    const nutrientData = nutrition
        ? createNutrition(nutrition.portion, nutrition.calories, nutrition.protein, nutrition.fat, nutrition.carbs)
        : undefined;

    return createPantryIngredient(
        type,
        brand,
        quantity, // Must be Measurement object or undefined
        nutrientData, // Must be Nutrition object or undefined
        expDate.unwrap()
    );
};