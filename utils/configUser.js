module.exports = (user) => {
  user.profilePic = user.profilePic
    ? "https://storage.googleapis.com/honeymish_profilepics/" + user.profilePic
    : "https://storage.googleapis.com/honeymish_profilepics/default_profile_pic.jpg";
};
