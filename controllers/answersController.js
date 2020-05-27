const mobilenet = require("@tensorflow-models/mobilenet");
const nsfwjs = require("nsfwjs");

const tfnode = require("@tensorflow/tfjs-node");
const compareResults = require("../utils/compareResults");

const imageClassification = async (imageBuffer) => {
  const image = tfnode.node.decodeImage(imageBuffer);
  const mobilenetModel = await mobilenet.load();
  // const nsfwjsModel = await nsfwjs.load();
  const predictions = await mobilenetModel.classify(image);
  return predictions;
};

const Question = require("../models/Question");

const getPublicUrl = (bucketName, fileName) =>
  `https://storage.googleapis.com/${bucketName}/${fileName}`;

exports.processImage = async (req, res) => {
  const updateBody =
    req.file && req.file.cloudStorageName
      ? { objectPhoto: req.file.cloudStorageName }
      : {};
  if (updateBody.objectPhoto) {
    const objectPhotoUrl = getPublicUrl(
      "honeymish_objectphotos",
      updateBody.objectPhoto
    );

    const imageData = {
      photo: objectPhotoUrl,
      result: "processing",
      photoId: req.body.photoId,
      photoProps: {
        width: req.body.width,
        height: req.body.height,
      },
    };
    console.log("online:", req.body.online);
    if (req.body.online === "true") {
      console.log("girdim");
      const socketIds = req.body.room.split("/");

      const otherUserIdIndex =
        (socketIds.findIndex((id) => id === req.body.socketId) + 1) % 2;

      const otherUserId = socketIds[otherUserIdIndex];

      const otherSocket = req.io.sockets.connected[otherUserId];
      if (otherSocket) {
        otherSocket.emit("otherPersonsAnswer", imageData);
      } else {
        res.status(400).json({ message: "Socket was not connected" });
      }
    }

    // process the image
    const predictions = await imageClassification(req.file.buffer);
    console.log(predictions);

    const result = compareResults(JSON.parse(req.body.answers), predictions);

    //send the result
    if (req.body.online === "true") {
      if (result) {
        // req.io.to(req.body.room).emit("objectData", {
        //   photo: objectPhotoUrl,
        //   result,
        //   photoId: req.body.photoId,
        //   question: randomQuestion,
        // });
      } else {
        req.io.to(req.body.room).emit("objectData", {
          photo: objectPhotoUrl,
          result,
          photoId: req.body.photoId,
        });
      }
    }

    imageData.result = result;
    res.status(200).json({ ...imageData, ...predictions });
  } else {
    res.status(400).send({ message: "There are no files provided." });
  }
};

exports.sendImage = (req, res) => {
  const updateBody =
    req.file && req.file.cloudStorageName
      ? { objectPhoto: req.file.cloudStorageName }
      : {};
  if (updateBody.objectPhoto) {
    const objectPhotoUrl = getPublicUrl(
      "honeymish_objectphotos",
      updateBody.objectPhoto
    );

    console.log("url:", objectPhotoUrl);

    const socketIds = req.body.room.split("/");

    const otherUserIdIndex =
      (socketIds.findIndex((id) => id === req.body.socketId) + 1) % 2;

    const otherUserId = socketIds[otherUserIdIndex];
    console.log("Photo props:", req.body);
    const imageData = {
      photo: objectPhotoUrl,
      result: "processing",
      photoId: req.body.photoId,
      photoProps: {
        width: req.body.width,
        height: req.body.height,
      },
    };
    const otherSocket = req.io.sockets.connected[otherUserId];
    if (otherSocket) {
      otherSocket.emit("otherPersonsAnswer", imageData);
    } else {
      res.status(400).json({ message: "Socket was not connected" });
    }

    res.status(200).json(imageData);
  } else {
    res.status(400).send({ message: "There are no files provided." });
  }
};
