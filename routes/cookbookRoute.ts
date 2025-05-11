import express, { Request, Response } from 'express';
import cookbookDAO from '../dao/cookbook.dao';
import recipeDAO from '../dao/recipe.dao';
import { BaseRecipe, BaseRecipeDTO, Recipe, Tag, fromDTO } from '../models/recipe';
import { None, Some } from 'ts-results-es';

const router = express.Router();

// GET test
router.get('/test', (req: Request, res: Response): void => {
    console.log('Hello World');
    res.status(200).end();
});

router.get('/:userId', async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const result = await cookbookDAO.getCookbook(userId);

        result.isOk()
            ? res.status(200).json(result.unwrap())
            : res.status(404).json({ error: result.error.message });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:userId/recipes', async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const recipeData: BaseRecipeDTO = req.body;

        const domain = fromDTO(recipeData);
        /*         console.log('Domain:', domain);
                domain.ingredients.forEach((ingredient) => { console.warn(ingredient.quantity) }); */

        const result = await cookbookDAO.createRecipe(userId, domain);

        console.log('Result:', result);

        if (result.isOk()) {
            res.status(201).json(result.unwrap());
        } else {
            res.status(400).json({ error: result.error.message });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:userId/recipes/:recipeId', async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const recipeId = req.params.recipeId;

        const result = await cookbookDAO.removeRecipe(userId, recipeId);

        if (result.isOk()) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: result.error.message });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:userId/recipes/:recipeId', async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const recipeId = req.params.recipeId;

        const result = await cookbookDAO.getRecipe(userId, recipeId);

        result.isOk()
            ? res.status(200).json(result.unwrap())
            : res.status(404).json({ error: result.error.message });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:userId/search', async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const { tag } = req.query;

        if (!tag || typeof tag !== 'string') {
            res.status(400).json({ error: 'Tag parameter is required' });
        }

        const result = await cookbookDAO.searchRecipesByTag(userId, tag as string);

        result.isOk()
            ? res.status(200).json(result.unwrap())
            : res.status(404).json({ error: result.error.message });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/recipes/:recipeId', async (req: Request, res: Response) => {
    try {
        const recipeId = req.params.recipeId;
        const data: BaseRecipeDTO = req.body;

        const base = fromDTO(data);
        const recipeData: Recipe = {
            ...base,
            id: recipeId,
        };

        const result = await recipeDAO.updateRecipe(recipeData);

        if (result.isOk()) {
            res.status(200).json(result.unwrap());
        } else {
            res.status(404).json({ error: result.error.message });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/recipes/:recipeId/tags', async (req: Request, res: Response) => {
    try {
        const recipeId = req.params.recipeId;
        const data:{name:string, description?: string} = req.body;
        const tag: Tag = {
            name: data.name,
            description: data.description ? Some(data.description) : None,
        };
        // const tag: Tag = req.body;

        if (!tag || !tag.name) {
            res.status(400).json({ error: 'Tag name is required' });
        }

        const result = await recipeDAO.addTag(recipeId, tag);

        if (result.isOk()) {
            res.status(200).json(result.unwrap());
        } else {
            res.status(404).json({ error: result.error.message });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/recipes/:recipeId/tags/:tagName', async (req: Request, res: Response) => {
    try {
        const recipeId = req.params.recipeId;
        const tagName = req.params.tagName;

        const result = await recipeDAO.removeTag(recipeId, tagName);

        if (result.isOk()) {
            res.status(200).json(result.unwrap());
        } else {
            res.status(404).json({ error: result.error.message });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/recipes/:recipeId/description', async (req: Request, res: Response) => {
    try {
        const recipeId = req.params.recipeId;
        const { description } = req.body;

        if (description === undefined) {
            res.status(400).json({ error: 'Description is required' });
        }

        const result = await recipeDAO.updateDescription(recipeId, description);

        if (result.isOk()) {
            res.status(200).json(result.unwrap());
        } else {
            res.status(404).json({ error: result.error.message });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;