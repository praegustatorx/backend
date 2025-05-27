import express, { NextFunction, Request, Response } from 'express';
import { predictProduct, ocrProduct } from '../services/ModelServices';
import upload from '../config/multer'; // Assuming you have multer configured for file uploads
import { FetchNutrientInfo } from '../chatbot/gemini';

const router = express.Router();

router.post('/predict', upload.single('file'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).send({ message: 'No file uploaded.' });
            return;
        }
        const result = await predictProduct(req.file);
        if (result.isOk()) {
            const nutrientsResult = await FetchNutrientInfo(result.unwrap().predicted_class);
            console.log('Nutrient info:', nutrientsResult);

            if (nutrientsResult.isOk()) {
                const inner = nutrientsResult.unwrap();
                res.status(200).send({ type: inner.type, info: inner.nutrition, confidence: result.unwrap().confidence });
                return;
            }
            else {
                console.error('Error fetching nutrient info:', nutrientsResult.unwrapErr().message);
                res.status(500).send({ message: 'Error fetching nutrient info' });
                return;
            }
            // res.status(200).send(result);
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
