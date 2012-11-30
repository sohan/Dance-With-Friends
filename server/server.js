var express = require('express')
  , http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);


// Vars (better way to organize all this)
var users = {}
var id_counter = 0;
var update_speed = 100; //100 ms

// Server's state stuff (flags n shit)
var state = {
  running: false, 
  time_started: 0,
  players: {
  },
};

// State that the user needs to know about (ie. for the game)
var game_state = {
  time: 0,
  current_song: 'Gungam'
};

// io.sockets references all sockets
io.sockets.on('connection', function (socket) {

  init_player(socket.sessionId);

  // socket is only the newly connected socket
  socket.on('start', function(data) { // Start game loop when someone hits it
    if (!state.running) {
      state.time_started = new Date().getTime();
      state.running = true;
      state.time_started

      setInterval(function(){game_loop(socket)}, update_speed);
    }
  });

});

// used for time synchronization
io.sockets.on('ping', function(socket){
    socket.emit('ping', {time new Date().getTime()});
};

game_loop = function(socket){
  game_state.time = new Date().getTime() - state.time_started;

  io.sockets.emit('sync', game_state);
};

init_player = function(sessionId) {
  state.players[sessionId] = {
    score: 0
  };
}


// Route our basic page
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

server.listen(8082);

