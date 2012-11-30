// Filename: main.js

// Require.js allows us to configure shortcut alias
// There usage will become more apparent further along in the tutorial.
require.config({
  paths: {
    jquery: '../lib/jquery.min',
    underscore: '../lib/underscore-min',
    backbone: '../lib/backbone-min',
    bootstrap: '../lib/bootstrap.min',
    bufferloader: '../lib/buffer-loader.min',
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
//dump facebook connect here
  window.fbAsyncInit = function() {
    // init the FB JS SDK
    FB.init({
      appId      : '441141345973790', // App ID from the App Dashboard
      channelUrl : '//haxathon.com:8082/static/channel.html', // Channel File for x-domain communication
      status     : true, // check the login status upon init?
      cookie     : true, // set sessions cookies to allow your server to access the session?
      xfbml      : false  // parse XFBML tags on this page?
    });

    // Additional initialization code such as adding Event Listeners goes here

     App.router = new Router();
     Backbone.history.start();
  };

  // Load the SDK's source Asynchronously
  // Note that the debug version is being actively developed and might 
  // contain some type checks that are overly strict. 
  // Please report such bugs using the bugs tool.
  (function(d, debug) {
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
     ref.parentNode.insertBefore(js, ref);
   } (document, /*debug*/ false));

});
