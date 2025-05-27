import multer from 'multer';

const storage = multer.diskStorage({
    filename: function (_req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

export default upload;
