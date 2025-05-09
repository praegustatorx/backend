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

// Update user preferences
router.post("/:userId", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const { allergies, diets, blacklist } = req.body;

        const userPrefs = preferencesFromDTO({ allergies, diets, blacklist });
        const result = await preferencesDAO.updatePreferences(userId, userPrefs);

        if (result.isOk()) {
            res.status(200).end(); // Changed from 201 to 200 for update
        } else {
            console.error('Error updating preferences via DAO:', result.error);
            res.status(500).json({ message: result.error.message || 'Failed to update preferences' });
        }
    } catch (error) {
        console.error('Error creating/updating preferences:', error);
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

        const getResult = await preferencesDAO.getPreferencesByUserId(userId);
        if (getResult.isErr()) {
            res.status(404).json({ message: getResult.error.message || "Preferences not found" });
            return;
        }
        const preferences = getResult.value;
        addAllergy(preferences, allergy as Allergy);

        const updateResult = await preferencesDAO.updatePreferences(userId, preferences);
        if (updateResult.isOk()) {
            res.status(200).end();
        } else {
            console.error('Error adding allergy via DAO:', updateResult.error);
            res.status(500).json({ message: updateResult.error.message || 'Failed to save allergy' });
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

        const getResult = await preferencesDAO.getPreferencesByUserId(userId);
        if (getResult.isErr()) {
            res.status(404).json({ message: getResult.error.message || "Preferences not found" });
            return;
        }
        const preferences = getResult.value;
        const allergyRemovedResult = removeAllergy(preferences, allergyParam);

        if (allergyRemovedResult.isErr()) {
            res.status(400).json({ message: allergyRemovedResult.error.message });
            return;
        }

        const updateResult = await preferencesDAO.updatePreferences(userId, preferences);
        if (updateResult.isOk()) {
            res.status(200).end();
        } else {
            console.error('Error removing allergy via DAO:', updateResult.error);
            res.status(500).json({ message: updateResult.error.message || 'Failed to save changes after removing allergy' });
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

        const getResult = await preferencesDAO.getPreferencesByUserId(userId);
        if (getResult.isErr()) {
            res.status(404).json({ message: getResult.error.message || "Preferences not found" });
            return;
        }
        const preferences = getResult.value;
        addDiet(preferences, dietResult.unwrap());

        const updateResult = await preferencesDAO.updatePreferences(userId, preferences);
        if (updateResult.isOk()) {
            res.status(200).end();
        } else {
            console.error('Error adding diet via DAO:', updateResult.error);
            res.status(500).json({ message: updateResult.error.message || 'Failed to save diet' });
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

        const getResult = await preferencesDAO.getPreferencesByUserId(userId);
        if (getResult.isErr()) {
            res.status(404).json({ message: getResult.error.message || "Preferences not found" });
            return;
        }
        const preferences = getResult.value;
        const dietRemovedResult = removeDietByName(preferences, dietName);

        if (dietRemovedResult.isErr()) {
            res.status(400).json({ message: dietRemovedResult.unwrapErr().message });
            return;
        }

        const updateResult = await preferencesDAO.updatePreferences(userId, preferences);
        if (updateResult.isOk()) {
            res.status(200).end();
        } else {
            console.error('Error removing diet via DAO:', updateResult.error);
            res.status(500).json({ message: updateResult.error.message || 'Failed to save changes after removing diet' });
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

        const getResult = await preferencesDAO.getPreferencesByUserId(userId);
        if (getResult.isErr()) {
            res.status(404).json({ message: getResult.error.message || "Preferences not found" });
            return;
        }
        const preferences = getResult.value;
        addToBlacklist(preferences, ingredient);

        const updateResult = await preferencesDAO.updatePreferences(userId, preferences);
        if (updateResult.isOk()) {
            res.status(200).end();
        } else {
            console.error('Error adding to blacklist via DAO:', updateResult.error);
            res.status(500).json({ message: updateResult.error.message || 'Failed to save blacklist change' });
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

        const getResult = await preferencesDAO.getPreferencesByUserId(userId);
        if (getResult.isErr()) {
            res.status(404).json({ message: getResult.error.message || "Preferences not found" });
            return;
        }
        const preferences = getResult.value;
        const isRemovedResult = removeFromBlacklist(preferences, ingredientId);

        if (isRemovedResult.isErr()) {
            res.status(400).json({ message: isRemovedResult.unwrapErr().message });
            return;
        }

        const updateResult = await preferencesDAO.updatePreferences(userId, preferences);
        if (updateResult.isOk()) {
            res.status(200).end();
        } else {
            console.error('Error removing from blacklist via DAO:', updateResult.error);
            res.status(500).json({ message: updateResult.error.message || 'Failed to save changes after removing from blacklist' });
        }
    } catch (error) {
        console.error('Error removing ingredient from blacklist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
