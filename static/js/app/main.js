// Filename: main.js

// Require.js allows us to configure shortcut alias
// There usage will become more apparent further along in the tutorial.
require.config({
  paths: {
    jquery: '../lib/jquery.min',
    underscore: '../lib/underscore-min',
    backbone: '../lib/backbone-min',
    bootstrap: '../lib/bootstrap.min',
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
  'router',
], function(App, Router) {
    // The "app" dependency is passed in as "App"
    App.router = new Router();
    Backbone.history.start();
});
