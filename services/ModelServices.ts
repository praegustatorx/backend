import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { Result, Ok, Err } from 'ts-results-es';

// Define interfaces for the expected responses
interface PredictResponse {
    predicted_class: string;
    confidence: number;
}

interface OcrResponse {
    extracted_text: string;
}

const pyBackUrl = process.env.PY_URL

export const predictProduct = async (file: Express.Multer.File): Promise<Result<PredictResponse, Error>> => {
    console.warn(`Calling Python API for predict with file: ${file.originalname}`);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);

    try {
        const response = await axios.post<PredictResponse>(pyBackUrl + 'predict/', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        console.log('Python server response for /predict:', response.data);
        return Ok(response.data);
    } catch (error) {
        console.error('Error calling /predict endpoint:', error);
        if (error instanceof Error) {
            return Err(error);
        }
        return Err(new Error('An unknown error occurred'));
    } finally {
        if (file.path) {
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error(`Failed to delete temporary file: ${file.path}`, err);
                }
            });
        }
    }
};

export const ocrProduct = async (file: Express.Multer.File): Promise<Result<OcrResponse, Error>> => {
    console.warn(`Calling Python API for ocr with file: ${file.originalname}`);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);

    try {
        const response = await axios.post<OcrResponse>(pyBackUrl + 'ocr/', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        console.log('Python server response for /ocr:', response.data);
        return Ok(response.data);
    } catch (error) {
        console.error('Error calling /ocr endpoint:', error);
        if (error instanceof Error) {
            return Err(error);
        }
        return Err(new Error('An unknown error occurred'));
    } finally {
        if (file.path) {
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error(`Failed to delete temporary file: ${file.path}`, err);
                }
            });
        }
    }
};
