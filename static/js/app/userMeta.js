// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'socket',
], function($, _, Backbone, App, socket) {
    var UserMeta = App.UserMeta || {};

    UserMeta.Model = Backbone.Model.extend({
        defaults: {
            score: 0.0,
            name: undefined,
            elapsedTime: 0.0
        },
        update: function() {

        }
    });

    UserMeta.View = Backbone.View.extend({
        template: _.template($('#template-usermeta').html()),
        el: $('#user-meta-container'),
        initialize: function() {
            this.model.on('change', this.render, this);
            socket.on('sync', $.proxy(this.syncUserMeta, this));
            this.render();
        },
        render: function() {
            var dict = this.model.toJSON();
            this.$el.html(this.template(dict));
        },
        syncUserMeta: function(data) {
            this.model.set('elapsedTime', data.time); 
        },
    });

    return UserMeta;

});
