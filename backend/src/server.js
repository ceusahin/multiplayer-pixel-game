const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL'iniz
    methods: ["GET", "POST"],
  },
});

// Piksel verilerini tutacak grid
const pixelGrid = Array(100)
  .fill()
  .map(() => Array(100).fill("#FFFFFF"));

// Socket.IO bağlantı yönetimi
io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı");

  // Mevcut grid durumunu yeni bağlanan kullanıcıya gönder
  socket.emit("init", { grid: pixelGrid });

  socket.on("pixelUpdate", (data) => {
    try {
      const { x, y, color } = data;
      if (x >= 0 && x < 100 && y >= 0 && y < 100) {
        pixelGrid[y][x] = color;

        // Tüm bağlı kullanıcılara güncellemeyi gönder
        io.emit("pixelUpdate", { x, y, color });
      }
    } catch (error) {
      console.error("Mesaj işleme hatası:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı bağlantısı kesildi");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
