const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "ChatConnect",
        allowed_formats: [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "webp",
            "pdf",
            "doc",
            "docx",
            "zip"
        ]
    }
});

const upload = multer({
    storage
});

module.exports = upload;