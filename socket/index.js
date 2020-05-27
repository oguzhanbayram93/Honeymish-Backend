const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const Question = require("../models/Question");

const { addToQueue, removeFromQueue, queue } = require("./queue");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  findUser,
} = require("./users.js");

const PORT = 5000;

function startSocketServer(server) {
  const io = socketio(server);

  io.on("connect", (socket) => {
    console.log("we have a connection");

    socket.on("join", ({ name, room }, callback) => {
      console.log(`${name} has joined to room ${room}`);
      const { error, user } = addUser({ id: socket.id, name, room });

      if (error) return callback(error);

      socket.join(user.room);

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });

      callback();
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
      const user = removeUser(socket.id);
      removeFromQueue(socket.id);
      if (user) {
        io.to(user.room).emit("userLeft");

        io.to(user.room).emit("roomData", {
          room: user.room,
          users: getUsersInRoom(user.room),
        });
      }
    });

    // Match Making Stuff

    socket.on("addToQueue", () => {
      if (queue.length) {
        console.log("zaten birisi listedeymiş", queue);

        let firstUserID = queue[0];
        io.sockets.connected[firstUserID].emit("gameFound", {
          room: firstUserID + "/" + socket.id,
        });
        socket.emit("gameFound", { room: firstUserID + "/" + socket.id });
        removeFromQueue(firstUserID);
        console.log("sildim", queue);
      } else {
        addToQueue(socket);
        console.log("ekledim", queue);
      }
    });
  });

  return io;
}

module.exports = { startSocketServer };
