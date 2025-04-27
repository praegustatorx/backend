import express, { Request, Response} from 'express';

const router = express.Router();

// GET test
router.get('/test', (req: Request, res: Response): void => {
    console.log('Hello World');
    res.status(200).end();
});

export default router;