import express, { NextFunction, Request, Response } from 'express';
import { predictProduct, ocrProduct } from '../services/ModelServices';
import upload from '../config/multer'; // Assuming you have multer configured for file uploads

const router = express.Router();

router.post('/predict', upload.single('file'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).send({ message: 'No file uploaded.' });
            return;
        }
        const result = await predictProduct(req.file);
        if (result) {
            res.status(200).send(result);
        } else {
            res.status(500).send({ message: 'Error processing prediction' });
        }
    } catch (error) {
        next(error);
    }
});

router.post('/ocr', upload.single('file'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).send({ message: 'No file uploaded.' });
            return;
        }
        const result = await ocrProduct(req.file);
        if (result) {
            res.status(200).send(result);
        } else {
            res.status(500).send({ message: 'Error processing OCR' });
        }
    } catch (error) {
        next(error);
    }
});

export default router;
