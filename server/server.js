var express = require('express')
  , http = require('http')
  , path = require('path');

const fbId = '441141345973790';
const fbSecret = 'b61f25df6461d99681c5927e1575f5a1';
const fbCallbackAddress = 'http://hackathon.com:8082/dance';

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var auth = require('connect-auth');

var static_path = path.normalize(__dirname +'/../static');
app.configure(function() {
    app.use('/static', express.static(static_path));
    app.use(express.cookieParser('hellomoto'));
    app.use(express.session());
    app.use(auth([
        auth.Facebook({
            appId: fbId,
            appSecret: fbSecret,
            callback: fbCallbackAddress
        })
    ]));
});

// Vars (better way to organize all this)
var id_counter = 0;
var fps = 2;
var update_speed = 1000 / fps;

// Server's state stuff (flags n shit)
var state = {
    running: false, 
    time_started: 0,
};

// State that the user needs to know about (ie. for the game)
var game_state = {
    time: 0,
    song: 'Gungam Style',
    users: {

    },
};

// io.sockets references all sockets
io.sockets.on('connection', function (socket) {

    //on a new connection, init a new dude
    init_player(socket.id);

    // socket is only the newly connected socket
    socket.on('start', function(data) { // Start game loop when someone hits it
        if (!state.running) {
            state.time_started = new Date().getTime();
            state.running = true;

            setInterval(function(){game_loop(socket)}, update_speed);
        }
    });

    socket.on('move', function(data) {
        var user = game_state.users[socket.id];
    });

    socket.on('updateScore', function(data) {
        var user = game_state.users[socket.id];
        user.score = data.score;
    });

    socket.on('setUser', function(data) {
        var user = game_state.users[socket.id];
        user.fb_id = data.id;
        user.pic = data.pic;
        user.name = data.name;
    });

});

// used for time synchronization
io.sockets.on('ping', function(socket){
    socket.emit('ping', {});
});

game_loop = function(socket) {
    game_state.time = new Date().getTime() - state.time_started;

    var ret_state = {};
    var users = [];
    for (var key in game_state.users) {
        users.push(game_state.users[key]);
    }
    users.sort(function(a, b) { return b.score - a.score });
    ret_state.users = users;
    io.sockets.emit('sync', ret_state);
};

init_player = function(id) {
    game_state.users[id] = {
        score: 0,
        moves: [

        ],
        offset: 0,
        name: id,
        pic: '',
    };
};

// Route our basic page
app.get('/dance', function (req, res) {
    var filepath = path.normalize(__dirname + "/../index.html");
    res.sendfile(filepath);
});

app.get('/', function(req, res, params) {
    var filepath = path.normalize(__dirname + "/../login.html");
    res.sendfile(filepath);
});

app.get('/logout', function(req, res, params) {
    req.logout();
    res.writeHead(303, { 'Location': "/" });
    res.end('');
});

server.listen(8082);
