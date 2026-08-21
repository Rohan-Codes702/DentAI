const multer = require('multer');
const path = require('path');
const fs = require('fs');

const TMP_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const IMAGE_TYPES = /jpeg|jpg|png|webp/;
const DOC_TYPES = /pdf|jpeg|jpg|png/;

const imageFileFilter = (req, file, cb) => {
  const extOk = IMAGE_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = IMAGE_TYPES.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
};

const docFileFilter = (req, file, cb) => {
  const extOk = DOC_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = DOC_TYPES.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Only pdf/jpg/png files are allowed'));
};

const uploadXray = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: imageFileFilter,
});

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: imageFileFilter,
});

const uploadChatAttachment = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: docFileFilter,
});

module.exports = { uploadXray, uploadAvatar, uploadChatAttachment, TMP_DIR };
