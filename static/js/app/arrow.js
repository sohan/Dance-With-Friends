// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'app',
], function($, _, Backbone, App) {
    console.log($, _, Backbone);
    var Arrow = App.Arrow || {};

    Arrow.Model = Backbone.Model.extend({
        defaults: {
            timestamp: 0.0,
            type: '',
        },
    });

    Arrow.View = Backbone.View.extend({
        initialize: function() {
            console.log('initialize'); 
            this.render();
        },
        render: function() {
            console.log('render'); 
        },
    });
    
    console.log('arrow');

    return Arrow;
});
