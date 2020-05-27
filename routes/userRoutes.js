const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
// router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.get("/", authController.getUser);
router.patch("/updateMyPassword", authController.updatePassword);
router.get("/me", userController.getMe);
router.patch("/updateMe", userController.updateMe);
router.patch("/win", userController.win);

const uploadImagesToServer = require("../middlewares/uploadImageToServer");
const uploadImagesToGCS = require("../middlewares/uploadImageToGCS");

router.post(
  "/edit",
  uploadImagesToServer.multer.single("profilePic"),
  uploadImagesToGCS("honeymish_profilepics"),
  userController.edit
);

// router.use(authController.restrictTo("admin"));

// router
//   .route("/")
//   .get(userController.getAllUsers)
//   .post(userController.createUser);

// router
//   .route("/:id")
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
