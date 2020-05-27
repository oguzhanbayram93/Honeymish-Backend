const mongoose = require("mongoose");

const QuestionSchema = mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answers: {
    type: [String],
    required: true,
  },
});

const Question = mongoose.model("Questions", QuestionSchema);
module.exports = Question;
