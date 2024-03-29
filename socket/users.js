const users = [];

const addUser = ({ id, name, room }) => {
  console.log(name, room);
  name = name.trim().toLowerCase();

  const user = { id, name, room };

  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const findUser = (name) =>
  users.find(
    (user) => user.name.trim().toLowerCase() === name.trim().toLowerCase()
  );

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = {
  users,
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  findUser,
};
