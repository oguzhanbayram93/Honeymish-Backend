const queue = [];

const addToQueue = (socket) => {
  queue.push(socket.id);
};

const removeFromQueue = (element) => {
  let index = queue.findIndex((e) => e === element);
  queue.splice(index, 1);
};

module.exports = {
  addToQueue,
  removeFromQueue,
  queue,
};
