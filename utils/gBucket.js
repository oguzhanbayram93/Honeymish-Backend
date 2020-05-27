const { Storage } = require("@google-cloud/storage");
const path = require("path");

// google cloud setup
const gc = new Storage({
  keyFilename: path.join(__dirname + "../../honeymish-60e28cf6f6e5.json"),
  projectId: "honeymish",
});

module.exports = gc;
