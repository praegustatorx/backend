import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Define interfaces for the expected responses
interface PredictResponse {
    predicted_class: string;
    confidence: number;
}

interface OcrResponse {
    extracted_text: string;
}

export const predictProduct = async (file: Express.Multer.File): Promise<PredictResponse | undefined> => {
    console.warn(`Calling Python API for predict with file: ${file.originalname}`);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);

    try {
        const response = await axios.post<PredictResponse>('http://127.0.0.1:8000/predict/', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        console.log('Python server response for /predict:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error calling /predict endpoint:', error);
        return undefined;
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

export const ocrProduct = async (file: Express.Multer.File): Promise<OcrResponse | undefined> => {
    console.warn(`Calling Python API for ocr with file: ${file.originalname}`);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);

    try {
        const response = await axios.post<OcrResponse>('http://127.0.0.1:8000/ocr/', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        console.log('Python server response for /ocr:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error calling /ocr endpoint:', error);
        return undefined;
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
