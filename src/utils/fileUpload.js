import multer, { diskStorage } from "multer";

export const fileUpload = () => {
    const fileFilter = (req, file, cb) => {
        if (!["image/png", "image/jpeg"].includes(file.mimetype))
            // throw error + do not save the file
            return cb(new Error("Invalid Format!", { cause: 400 }), false);
        // save file + call next
        return cb(null, true)
    };
    return multer({ storage: diskStorage({}), fileFilter });
}