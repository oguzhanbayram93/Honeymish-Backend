const Multer = require("multer");
const path = require("path");

const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 7 * 1024 * 1024, // no larger than 5 mb
  },
  fileFilter: (req, file, cb) => {
    // allowed ext
    const filetypes = /jpeg|jpg|png/;
    // check ext
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      req.fileTypeError = true;
      cb();
    }
  },
});

module.exports = { multer };
