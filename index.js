const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let broadcaster;
let clientsCount = 0;

// Servir arquivos estáticos da pasta "public"
app.use(express.static(__dirname + "/public"));

// Rota para o painel de transmissão (studio)
app.get("/studio", (req, res) => {
  res.sendFile(__dirname + "/public/studio.html");
});

io.on("connection", (socket) => {
  console.log("Novo cliente conectado");

  // Identificar o cliente como um espectador
  socket.on("watch", () => {
    clientsCount++;
    io.emit("clients-update", clientsCount);
  });

  // Identificar o cliente como broadcaster
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });

  // Enviar as ofertas WebRTC do "broadcaster" para os "watchers"
  socket.on("offer", (id, offer) => {
    io.to(id).emit("offer", socket.id, offer);
  });

  // Enviar as respostas WebRTC dos "watchers" para o "broadcaster"
  socket.on("answer", (id, answer) => {
    io.to(id).emit("answer", socket.id, answer);
  });

  // Enviar candidatos ICE (para conexão P2P) entre broadcaster e watchers
  socket.on("candidate", (id, candidate) => {
    io.to(id).emit("candidate", socket.id, candidate);
  });

  // Atualizar o número de clientes ao desconectar
  socket.on("disconnect", () => {
    if (socket.id === broadcaster) {
      io.emit("broadcaster", null);
    } else {
      clientsCount--;
      io.emit("clients-update", clientsCount);
    }
  });
});

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
