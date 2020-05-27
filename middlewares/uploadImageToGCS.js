// import helpers
const EM = require("../utils/errorMessages");
const gc = require("../utils/gBucket");

const uploadImageToGCS = (targetBucketName) => (req, res, next) => {
  // if the extension is not excepted return an error
  if (req.fileTypeError) return res.status(400).send(EM.fileType);
  // no file just pass
  if (!req.file) return next();

  const targetBucket = gc.bucket(targetBucketName);

  const gcsname = Date.now() + "_" + req.file.originalname;
  const file = targetBucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
      rememberable: false,
    },
  });

  stream.on("error", (err) => {
    console.log(err);
    res.status(500).send(EM.GCSE);
  });

  stream.on("finish", () => {
    file.makePublic().then(() => {
      req.file.cloudStorageName = gcsname;
      next();
    });
  });

  stream.end(req.file.buffer);
};

module.exports = uploadImageToGCS;
