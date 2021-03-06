define([
    'app',
    'socketio',
], function(App, SocketIO) {
    var Socket = App.Socket || {};
    Socket.socket = Socket.socket || io.connect('http://' + window.hostname + window.socketPort);

    Socket.startGame = function() {
        Socket.socket.emit('start', {});
    }

    Socket.doMove = function(move, currentTime) {
        /*
        Socket.socket.emit('move', {
            move: move,
            currentTime: currentTime
        });
        */
    }

    Socket.updateScore = function(score) {
        Socket.socket.emit('updateScore', {
            score: score
        });
    }

    Socket.setUser = function(user) {
        Socket.socket.emit('setUser', user);
    }

    return Socket;
});
