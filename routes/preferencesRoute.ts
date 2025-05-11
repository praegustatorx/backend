import express, { Request, Response, NextFunction } from "express";
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
    preferencesIntoDTO,
} from "../models/preferences";
import { IngredientType } from "../models/ingredient";
import preferencesDAO from '../dao/preferences.dao'; // Import the DAO

const router = express.Router();

// GET test
router.get("/test", (req: Request, res: Response): void => {
    console.log("Hello World");
    res.status(200).end();
});

// GET user preferences
router.get("/:userId", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const result = await preferencesDAO.getPreferencesByUserId(userId);

        if (result.isOk()) {
            res.status(200).json(preferencesIntoDTO(result.value));
        } else {
            if (result.error.message.toLowerCase().includes('not found')) {
                res.status(404).json({ message: result.error.message });
            } else {
                console.error('Error fetching preferences via DAO:', result.error);
                res.status(500).json({ message: 'Internal server error retrieving preferences' });
            }
        }
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add allergy to user preferences
router.post("/:userId/allergies", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const { allergy } = req.body;

        if (!Object.values(Allergy).includes(allergy as Allergy)) {
            res.status(400).json({ message: "Invalid allergy type" });
            return;
        }

        const result = await preferencesDAO.addAllergy(userId, allergy as Allergy);

        if (result.isOk()) {
            res.status(200).end();
        } else {
            if (result.error.message.toLowerCase().includes('not found')) {
                res.status(404).json({ message: result.error.message });
            } else {
                console.error('Error adding allergy via DAO:', result.error);
                res.status(500).json({ message: result.error.message || 'Failed to save allergy' });
            }
        }
    } catch (error) {
        console.error('Error adding allergy:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Remove allergy from user preferences
router.delete("/:userId/allergies/:allergy", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const allergyParam = req.params.allergy as Allergy;

        if (!Object.values(Allergy).includes(allergyParam)) {
            res.status(400).json({ message: "Invalid allergy type" });
            return;
        }

        const result = await preferencesDAO.removeAllergy(userId, allergyParam);

        if (result.isOk()) {
            res.status(200).end();
        } else {
            if (result.error.message.toLowerCase().includes('not found in preferences')) {
                res.status(404).json({ message: result.error.message });
            } else if (result.error.message.toLowerCase().includes('preferences not found')) {
                res.status(404).json({ message: result.error.message });
            } else {
                console.error('Error removing allergy via DAO:', result.error);
                res.status(500).json({ message: result.error.message || 'Failed to save changes after removing allergy' });
            }
        }
    } catch (error) {
        console.error('Error removing allergy:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add diet to user preferences
router.post("/:userId/diets", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const { name, description } = req.body;

        const dietResult = createDiet(name, description);
        if (dietResult.isErr()) {
            res.status(400).json({ errors: dietResult.unwrapErr() });
            return;
        }
        const newDiet = dietResult.unwrap();
        const result = await preferencesDAO.addDiet(userId, newDiet);

        if (result.isOk()) {
            res.status(200).end();
        } else {
            if (result.error.message.toLowerCase().includes('not found')) {
                res.status(404).json({ message: result.error.message });
            } else {
                console.error('Error adding diet via DAO:', result.error);
                res.status(500).json({ message: result.error.message || 'Failed to save diet' });
            }
        }
    } catch (error) {
        console.error('Error adding diet:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Remove diet from user preferences
router.delete("/:userId/diets/:dietName", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const dietName = req.params.dietName;

        const result = await preferencesDAO.removeDietByName(userId, dietName);

        if (result.isOk()) {
            res.status(200).end();
        } else {
            if (result.error.message.toLowerCase().includes('not found in preferences')) {
                res.status(404).json({ message: result.error.message });
            } else if (result.error.message.toLowerCase().includes('preferences not found')) {
                res.status(404).json({ message: result.error.message });
            } else {
                console.error('Error removing diet via DAO:', result.error);
                res.status(500).json({ message: result.error.message || 'Failed to save changes after removing diet' });
            }
        }
    } catch (error) {
        console.error('Error removing diet:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add ingredient to blacklist
router.post("/:userId/blacklist", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const ingredient: IngredientType = req.body.ingredient;

        if (!ingredient) {
            res.status(400).json({ message: "Ingredient is required" });
            return;
        }

        const result = await preferencesDAO.addToBlacklist(userId, ingredient);

        if (result.isOk()) {
            res.status(200).end();
        } else {
            if (result.error.message.toLowerCase().includes('not found')) {
                res.status(404).json({ message: result.error.message });
            } else {
                console.error('Error adding to blacklist via DAO:', result.error);
                res.status(500).json({ message: result.error.message || 'Failed to save blacklist change' });
            }
        }
    } catch (error) {
        console.error('Error adding ingredient to blacklist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Remove ingredient from blacklist
router.delete("/:userId/blacklist/:ingredientId", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const ingredientId = req.params.ingredientId;

        const result = await preferencesDAO.removeFromBlacklist(userId, ingredientId);

        if (result.isOk()) {
            res.status(200).end();
        } else {
            if (result.error.message.toLowerCase().includes('not found in blacklist')) {
                res.status(404).json({ message: result.error.message });
            } else if (result.error.message.toLowerCase().includes('preferences not found')) {
                res.status(404).json({ message: result.error.message });
            } else {
                console.error('Error removing from blacklist via DAO:', result.error);
                res.status(500).json({ message: result.error.message || 'Failed to save changes after removing from blacklist' });
            }
        }
    } catch (error) {
        console.error('Error removing ingredient from blacklist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
