
import express, { Request, Response } from 'express';
import cookbookDAO from '../dao/cookbook.dao';
import recipeDAO from '../dao/recipe.dao';
import { BaseRecipe, Tag } from '../models/recipe';

const router = express.Router();

// GET test
router.get('/test', (req: Request, res: Response): void => {
    console.log('Hello World');
    res.status(200).end();
});

// Cookbook endpoints
router.post('/:userId', async (req: Request, res: Response) => {
    // Create a cookbook for a user
});

router.get('/:userId', async (req: Request, res: Response) => {
    // Get a user's cookbook
});

router.post('/:userId/recipes', async (req: Request, res: Response) => {
    // Create a recipe in user's cookbook
});

router.delete('/:userId/recipes/:recipeId', async (req: Request, res: Response) => {
    // Remove a recipe from user's cookbook
});

router.get('/:userId/recipes/:recipeId', async (req: Request, res: Response) => {
    // Get a specific recipe from user's cookbook
});

router.get('/:userId/search', async (req: Request, res: Response) => {
    // Search recipes by tag in user's cookbook
});

// Non-overlapping functions from recipe DAO
router.put('/recipes/:recipeId', async (req: Request, res: Response) => {
    // Update a recipe
});

router.post('/recipes/:recipeId/tags', async (req: Request, res: Response) => {
    // Add a tag to a recipe
});

router.delete('/recipes/:recipeId/tags/:tagName', async (req: Request, res: Response) => {
    // Remove a tag from a recipe
});

router.put('/recipes/:recipeId/description', async (req: Request, res: Response) => {
    // Update a recipe's description
});

export default router;