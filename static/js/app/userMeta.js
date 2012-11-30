// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'app',
], function($, _, Backbone, App) {
    var UserMeta = App.UserMeta || {};

    UserMeta.Model = Backbone.Model.extend({
        defaults: {
            score: 0.0,
            name: undefined
        }
    });

    UserMeta.View = Backbone.View.extend({
        template: _.template($('#template-usermeta').html()),
        el: $('#user-meta-container'),
        initialize: function() {
            this.model.on('change', this.render, this);
            this.render();
        },
        render: function() {
            var dict = this.model.toJSON();
            this.$el.html(this.template(dict));
        }
    });

    return UserMeta;

});
