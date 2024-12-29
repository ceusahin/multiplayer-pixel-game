const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://multiplayer-pixel-game.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://multiplayer-pixel-game.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Piksel verilerini tutacak grid
let pixelGrid = Array(50)
  .fill()
  .map(() => Array(50).fill("#FFFFFF"));

// Canvas durumunu periyodik olarak gönder
const sendCanvasUpdate = () => {
  io.emit("canvas:update", { grid: pixelGrid });
};

// Socket.IO bağlantı yönetimi
io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı");

  // Mevcut grid durumunu yeni bağlanan kullanıcıya gönder
  socket.emit("init", { grid: pixelGrid });

  socket.on("pixel:place", (data) => {
    try {
      const { x, y, color } = data;
      if (x >= 0 && x < 50 && y >= 0 && y < 50) {
        // Grid'i güncelle
        pixelGrid[y][x] = color;

        // Tüm bağlı kullanıcılara güncellemeyi gönder
        io.emit("pixel:update", { x, y, color });
      }
    } catch (error) {
      console.error("Mesaj işleme hatası:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı bağlantısı kesildi");
  });
});

// Her 4 saniyede bir canvas durumunu gönder
setInterval(sendCanvasUpdate, 4000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
