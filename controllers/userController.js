const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const EM = require("../utils/errorMessages");
const gc = require("../utils/gBucket");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const getPublicUrl = (bucketName, fileName) =>
  `https://storage.googleapis.com/${bucketName}/${fileName}`;

exports.edit = (req, res) => {
  const updateBody =
    req.file && req.file.cloudStorageName
      ? { profilePic: req.file.cloudStorageName }
      : {};

  // findOneAndUpdate return the the doc before update was applied
  User.findOneAndUpdate({ _id: req.user._id }, updateBody)
    .then((user) => {
      if (!user) throw new Error(EM.accNF);

      const previousFileName = user.get("profilePic", null, {
        getters: false,
      });

      if (updateBody.profilePic && previousFileName) {
        // delete the file and send the new profile URL
        gc.bucket("honeymish_profilepics")
          .file(previousFileName)
          .delete()
          .catch((err) => console.log(err));

        res.status(200).json({
          profilePic: getPublicUrl(
            "honeymish_profilepics",
            updateBody.profilePic
          ),
        });
      } else {
        res.status(200).json({
          profilePic: getPublicUrl(
            "honeymish_profilepics",
            updateBody.profilePic
          ),
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send(error.toString());
    });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    res.status(400).json({
      message:
        "This route is not for password updates. Please use /updateMyPassword.",
    });
    return;
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email", "profilePic");

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.win = catchAsync(async (req, res, next) => {
  // if gameType === online
  // increase the gold points of the user
  // if gameType === offline
  // increase the practiceScore of the user

  if (req.body.gameType === "offline" && !req.body.score) {
    res.status(400).json({
      status: "fail",
      message: "Please provide a score parameter",
    });
    return;
  }

  if (req.body.gameType === "online") {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      $inc: { gold: 10 },
    });

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } else if (req.body.gameType === "offline") {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      $inc: { practiceScore: req.body.score },
    });

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } else {
    res.status(400).json({ message: "Please provide valid parameters!" });
  }
});
