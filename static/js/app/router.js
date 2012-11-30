define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'game'
], function($, _, Backbone, App, Game) {
    var Router = Backbone.Router.extend({
        routes: {
            '*all': 'index'
        },
        index: function() {
            Game.initialize();
        },
    });

    return Router; 
});
