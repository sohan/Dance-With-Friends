define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'arrow'
], function($, _, Backbone, App, Arrow) {
    var Router = Backbone.Router.extend({
        routes: {
            '*all': 'index'
        },
        index: function() {
            var arrow = new Arrow.Model();
        },
    });

    return Router; 
});
