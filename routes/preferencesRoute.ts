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
import PreferencesModel, {
    toPreferences,
    fromPreferences,
} from "../database/preferencesSchema";

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

        const preferencesDoc = await PreferencesModel.findOne({ userId });
        if (!preferencesDoc) {
            res.status(404).json({ message: "Preferences not found" });
            return;
        }

        const preferences = toPreferences(preferencesDoc);
        res.status(200).json(preferencesIntoDTO(preferences));
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create or update user preferences
router.post("/:userId", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const { allergies, diets, blacklist } = req.body;

        const userPrefs = preferencesFromDTO({ allergies, diets, blacklist });

        await PreferencesModel.findOneAndUpdate(
            { userId },
            fromPreferences(userPrefs, userId),
            { upsert: true, new: true }
        );
        res.status(201).end();
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

        if (!Object.values(Allergy).includes(allergy)) {
            res.status(400).json({ message: "Invalid allergy type" });
            return;
        }

        const preferencesDoc = await PreferencesModel.findOne({ userId });
        if (!preferencesDoc) {
            res.status(404).json({ message: "Preferences not found" });
            return;
        }

        const preferences = toPreferences(preferencesDoc);
        addAllergy(preferences, allergy);

        await PreferencesModel.findOneAndUpdate(
            { userId },
            fromPreferences(preferences, userId)
        );
        res.status(200).end();
    } catch (error) {
        console.error('Error adding allergy:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Remove allergy from user preferences
router.delete("/:userId/allergies/:allergy", async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        const allergy = req.params.allergy as Allergy;

        const preferencesDoc = await PreferencesModel.findOne({ userId });
        if (!preferencesDoc) {
            res.status(404).json({ message: "Preferences not found" });
            return;
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

        const preferencesDoc = await PreferencesModel.findOne({ userId });
        if (!preferencesDoc) {
            res.status(404).json({ message: "Preferences not found" });
            return;
        }

        const preferences = toPreferences(preferencesDoc);
        addDiet(preferences, dietResult.unwrap());

        await PreferencesModel.findOneAndUpdate(
            { userId },
            fromPreferences(preferences, userId)
        );
        res.status(200).end();
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

        const preferencesDoc = await PreferencesModel.findOne({ userId });
        if (!preferencesDoc) {
            res.status(404).json({ message: "Preferences not found" });
            return;
        }

        const preferences = toPreferences(preferencesDoc);
        const dietRemoved = removeDietByName(preferences, dietName);

        if (dietRemoved.isErr()) {
            res.status(400).json({ message: dietRemoved.unwrapErr().message });
            return;
        }

        await PreferencesModel.findOneAndUpdate(
            { userId },
            fromPreferences(preferences, userId)
        );
        res.status(200).end();
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

        const preferencesDoc = await PreferencesModel.findOne({ userId });
        if (!preferencesDoc) {
            res.status(404).json({ message: "Preferences not found" });
            return;
        }

        const preferences = toPreferences(preferencesDoc);
        addToBlacklist(preferences, ingredient);

        await PreferencesModel.findOneAndUpdate(
            { userId },
            fromPreferences(preferences, userId)
        );
        res.status(200).end();
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

        const preferencesDoc = await PreferencesModel.findOne({ userId });
        if (!preferencesDoc) {
            res.status(404).json({ message: "Preferences not found" });
            return;
        }

        const preferences = toPreferences(preferencesDoc);
        const isRemoved = removeFromBlacklist(preferences, ingredientId);

        if (isRemoved.isErr()) {
            res.status(400).json({ message: isRemoved.unwrapErr().message });
            return;
        }

        await PreferencesModel.findOneAndUpdate(
            { userId },
            fromPreferences(preferences, userId)
        );
        res.status(200).end();
    } catch (error) {
        console.error('Error removing ingredient from blacklist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
