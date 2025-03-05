import express, { Request, Response } from 'express';
import cloudinary from '../utils/cloudinary';
import upload from '../config/multer';

import mongoose from 'mongoose';
import ImageModel from '../models/image';


const router = express.Router();

router.post('/upload', upload.single('image'), async function (req, res) {
    try {
        // if (!req.file) {
        //     res.status(400).json({
        //         success: false,
        //         message: "No file uploaded"
        //     });``
        //     return;
        // }

        const result = await cloudinary.uploader.upload(req!.file!.path);

        const newImage = new ImageModel({
            url: result.url,
            original_filename: result.original_filename
        });

        const savedImage = await newImage.save(); // No callback, use await

        res.status(200).json({
            success: true,
            message: "Uploaded and saved to database!",
            data: savedImage,
            result: result
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Error"
        });
    }
});

export default router;