// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'app',
], function($, _, Backbone, App) {
    var Arrow = App.Arrow || {};

    Arrow.Model = Backbone.Model.extend({
        defaults: {
            timestamp: 0.0,
            direction: '',
        },
    });

    Arrow.View = Backbone.View.extend({
        el: $('#arrows-container'),
        template: _.template($('#template-arrow').html()),
        initialize: function() {
            console.log('initialize'); 
            this.render();
        },
        render: function() {
            var dict = this.model.toJSON();
            var html = this.template(dict);
            console.log(html);
            this.$el.append(html);
        },
    });
    
    console.log('arrow');

    return Arrow;
});
