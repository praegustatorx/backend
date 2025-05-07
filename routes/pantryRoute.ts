import express, { Request, Response } from 'express';
import PantryModel, { toPantry, fromPantry, PantryDocument } from '../database/pantrySchema';
import { createPantry, addIngredient, removeIngredient, getExpiredIngredients } from '../models/pantry';
import { CreatePantryIngredient } from '../models/ingredient';
import { None, Some } from 'ts-results-es';

const router = express.Router();

// GET test
router.get('/test', (req: Request, res: Response): void => {
    console.log('Hello World');
    res.status(200).end();
});

// GET user's pantry
router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const pantryDoc = await PantryModel.findOne({ userId });

        if (!pantryDoc) {
            res.status(404).json({ message: 'Pantry not found' });
            return;
        }

        const pantry = toPantry(pantryDoc);
        res.status(200).json({
            userId: pantryDoc.userId,
            ingredients: Array.from(pantry.ingredients.values())
        });
    } catch (error) {
        console.error('Error fetching pantry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET expired ingredients
router.get('/:userId/expired', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { date } = req.query;
        let expirationDate: Date;

        if (date) {
            const parsedDate = Date.parse(date.toString());
            if (isNaN(parsedDate)) {
                res.status(400).json({ message: 'Invalid date format' });
                return;
            }
            expirationDate = new Date(parsedDate);
        } else {
            expirationDate = new Date();
        }
        const pantryDoc = await PantryModel.findOne({ userId });

        if (!pantryDoc) {
            res.status(404).json({ message: 'Pantry not found' });
            return;
        }

        const pantry = toPantry(pantryDoc);
        const expiredIngredients = Array.from(getExpiredIngredients(pantry, expirationDate));

        res.status(200).json({ expiredIngredients });
    } catch (error) {
        console.error('Error fetching expired ingredients:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST create or update pantry
router.post('/:userId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { ingredients } = req.body;

        // Convert incoming ingredients to domain model
        const pantryIngredients = ingredients.map((ing: any) => CreatePantryIngredient(
            ing.id,
            ing.brand ? Some(ing.brand) : None,
            ing.type, // Changed from genericId to type
            ing.quantity ? Some(ing.quantity) : None,
            ing.nutrition,
            ing.expiration_date ? Some(new Date(ing.expiration_date)) : None
        ));

        const pantry = createPantry(pantryIngredients);
        const pantryData = fromPantry(pantry, userId);

        // Upsert the pantry (create if not exists, update if exists)
        const result = await PantryModel.findOneAndUpdate(
            { userId },
            pantryData,
            { new: true, upsert: true }
        );

        res.status(201).json({
            userId: result.userId,
            ingredients: Array.from(toPantry(result).ingredients.values())
        });
    } catch (error) {
        console.error('Error creating/updating pantry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT add ingredient to pantry
router.put('/:userId/ingredients', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const ingredientData = req.body;

        // Find the user's pantry
        let pantryDoc = await PantryModel.findOne({ userId });

        // If pantry doesn't exist, create a new one
        if (!pantryDoc) {
            const newPantry = createPantry();
            const pantryData = fromPantry(newPantry, userId);
            pantryDoc = await PantryModel.create(pantryData);
        }

        // Convert to domain model
        const pantry = toPantry(pantryDoc);

        // Create the ingredient and add it to pantry
        const ingredient = CreatePantryIngredient(
            ingredientData.id,
            ingredientData.brand ? Some(ingredientData.brand) : None,
            ingredientData.type, // Changed from genericId to type
            ingredientData.quantity ? Some(ingredientData.quantity) : None,
            ingredientData.nutrition,
            ingredientData.expiration_date ? Some(new Date(ingredientData.expiration_date)) : None
        );

        addIngredient(pantry, ingredient);

        // Update the database
        const updatedPantryData = fromPantry(pantry, userId);
        await PantryModel.findOneAndUpdate(
            { userId },
            updatedPantryData,
            { new: true }
        );

        res.status(200).end();
    } catch (error) {
        console.error('Error adding ingredient to pantry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE remove ingredient from pantry
router.delete('/:userId/ingredients/:ingredientId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, ingredientId } = req.params;

        // Find the user's pantry
        const pantryDoc = await PantryModel.findOne({ userId });

        if (!pantryDoc) {
            res.status(404).json({ message: 'Pantry not found' });
            return;
        }

        // Convert to domain model
        const pantry = toPantry(pantryDoc);

        // Remove ingredient
        const result = removeIngredient(pantry, ingredientId);

        if (result.isErr()) {
            res.status(404).json({ message: 'Ingredient not found in pantry' });
            return;
        }

        // Update the database
        const updatedPantryData = fromPantry(pantry, userId);
        await PantryModel.findOneAndUpdate(
            { userId },
            updatedPantryData,
            { new: true }
        );

        res.status(200).end();
    } catch (error) {
        console.error('Error removing ingredient from pantry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;