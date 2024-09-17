const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const cors = require("cors");
const io = socketio(server, {
  cors: {
    origin: "https://realtime-location-tracker-rouge.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
  transports: ["websocket", "polling"], // Force WebSocket transport
  allowUpgrades: false,
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Handle socket connections
io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("send-location", (data) => {
    console.log("Location data received:", data);
    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    io.emit("user-disconnected", socket.id);
  });
});

// Render the index page
app.get("/", function (req, res) {
  res.render("index");
});

// Listen on the port specified by the environment variable or default to 3000
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
