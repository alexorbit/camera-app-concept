const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir arquivos estáticos da pasta "public"
app.use(express.static(__dirname + "/public"));

// Receber e retransmitir o stream de vídeo para todos os clientes
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  // Escutar pelo stream de vídeo
  socket.on("video-stream", (data) => {
    // Transmitir o stream recebido para todos os outros clientes conectados
    socket.broadcast.emit("video-stream", data);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Iniciar o servidor na porta 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

