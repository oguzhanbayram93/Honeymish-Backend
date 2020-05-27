const express = require("express");
const answersController = require("../controllers/answersController");
const authController = require("../controllers/authController");

const router = express.Router();

const uploadImagesToGCS = require("../middlewares/uploadImageToGCS");
const uploadImagesToServer = require("../middlewares/uploadImageToServer");

router.use(authController.protect);

router.post(
  "/processImage",
  uploadImagesToServer.multer.single("objectPhoto"),
  uploadImagesToGCS("honeymish_objectphotos"),
  answersController.processImage
);

router.post(
  "/sendImage",
  uploadImagesToServer.multer.single("objectPhoto"),
  uploadImagesToGCS("honeymish_objectphotos"),
  answersController.sendImage
);

module.exports = router;
