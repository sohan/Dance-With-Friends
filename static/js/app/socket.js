define([
    'app',
    'socketio',
], function(App, SocketIO) {
    var socket = App.socket || io.connect('http://localhost:8082');

    return socket;
});
