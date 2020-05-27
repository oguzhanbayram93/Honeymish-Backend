module.exports = (answers, predictions) => {
  console.log(answers, predictions);
  let result;
  const potentialAnswers =
    predictions[0].className +
    "," +
    predictions[1].className +
    "," +
    predictions[2].className;
  const potentialAnswersArray = potentialAnswers.split(",");

  let match = null;
  answers.forEach((answer) => {
    temp = potentialAnswersArray.find((ans) =>
      ans.toLowerCase().includes(answer.toLowerCase())
    );
    if (temp) {
      match = temp;
    }
  });
  if (match) {
    result = true;
  } else {
    result = false;
  }

  return result;
};
