define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'game',
  'userMeta'
], function($, _, Backbone, App, Game, UserMeta) {
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
