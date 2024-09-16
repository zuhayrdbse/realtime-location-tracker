const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Handle socket connections
io.on("connection", function (socket) {
  console.log("New user connected");

  socket.on("send-location", function (data) {
    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", function () {
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
