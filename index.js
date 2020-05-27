const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

require("dotenv/config");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// Middlewares
app.use(helmet());
app.use(cors());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["question", "answers"],
  })
);

// Import Routes
const questionsRoute = require("./routes/questions");
const userRouter = require("./routes/userRoutes");
const answers = require("./routes/answers");

const socketServer = http.createServer(app);

const io = require("./socket/index").startSocketServer(socketServer);

socketServer.listen(5000, () =>
  console.log(`Socket server has started on port ${5000}`)
);

// ROUTES

app.use("/api/questions", questionsRoute);
app.use("/api/users", userRouter);

app.use(function (req, res, next) {
  req.io = io;
  next();
});
app.use("/api/answers", answers);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Connect to DB

mongoose
  .connect(process.env.DB_CONNECTION, {
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connected to db");
  });

app.use(globalErrorHandler);

const server = app.listen(process.env.PORT);

// // Socket
// const socket = require("./socket/index");
// const io = socket.startSocketServer(server);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// // Serving static files
// app.use(express.static(`${__dirname}/public`));
