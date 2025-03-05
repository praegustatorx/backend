import { Schema, model } from 'mongoose';

const imageSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    original_filename: {
        type: String,
        required: true
    }
});

const ImageModel = model('ImageModel', imageSchema);

export default ImageModel;