const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 静的ファイル配信
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // ニックネーム保存（任意）
  socket.on('set-nick', (nick) => {
    socket.data.nick = nick || 'Anonymous';
    socket.emit('system', `ニックネームを ${socket.data.nick} に設定しました`);
  });

  // メッセージ受信
  socket.on('chat-message', (msg) => {
    const payload = {
      id: socket.id,
      nick: socket.data.nick || 'Anonymous',
      msg,
      time: Date.now()
    };
    // 全員へブロードキャスト
    io.emit('chat-message', payload);
  });

  socket.on('disconnect', (reason) => {
    console.log('user disconnected:', socket.id, reason);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
