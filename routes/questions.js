const express = require("express");
const router = express.Router();

// Import db models

const Question = require("../models/Question");

// Get all the questions
router.get("/", (req, res) => {
  Question.find()
    .then((questions) => {
      res.json(questions);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

// Create one question
router.post("/create", (req, res) => {
  const question = new Question({
    question: req.body.question,
    answers: req.body.answers,
  });

  question
    .save()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

// Get a random question

router.get("/random", (req, res) => {
  Question.countDocuments().exec(function (err, count) {
    // Get a random entry
    var random = Math.floor(Math.random() * count);

    try {
      // Again query all users but only fetch one offset by our random #
      Question.findOne()
        .skip(random)
        .exec(function (err, result) {
          // Tada! random user
          console.log(result);
          res.json(result);
        });
    } catch (error) {
      res.json({ message: error });
    }
  });
});

module.exports = router;
