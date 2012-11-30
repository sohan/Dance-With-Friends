require.config({
  paths: {
    jquery: '../lib/jquery.min',
    underscore: '../lib/underscore-min',
    backbone: '../lib/backbone-min',
    bootstrap: '../lib/bootstrap.min',
    bufferloader: '../lib/buffer-loader',
    socketio: '/socket.io/socket.io.js',
  },
  shim: {
    underscore: {
        deps: ['jquery'],
        exports: '_'
    },

    backbone: {
        deps: ['underscore', 'jquery'],
        exports: 'Backbone'
    }
  }
});

require([
  // Load our app module and pass it to our definition function
  'app',
], function(App) {
    // The "app" dependency is passed in as "App"
    //
});
