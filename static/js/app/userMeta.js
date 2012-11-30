// Filename: app.js
define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'socket',
], function($, _, Backbone, App, Socket) {
    var UserMeta = App.UserMeta || {};

    UserMeta.Model = Backbone.Model.extend({
        defaults: {
            score: 0.0,
            name: undefined,
            elapsedTime: 0.0,
            players: [],
        },
        initialize: function() {
            this.on('change:score', this.sync, this);
            Socket.setUser({
                id: window.userId,
                name: window.userName,
                pic: window.userPic,
            });
        },
        sync: function() {
            Socket.updateScore(this.get('score'));
        },
    });

    UserMeta.View = Backbone.View.extend({
        template: _.template($('#template-usermeta').html()),
        el: $('#user-meta-container'),
        initialize: function() {
            this.model.on('change', this.render, this);
            Socket.socket.on('sync', $.proxy(this.syncUserMeta, this));
            this.render();
        },
        render: function() {
            var dict = this.model.toJSON();
            this.$el.html(this.template(dict));
        },
        syncUserMeta: function(data) {
            this.model.set('elapsedTime', data.time); 
            this.model.set('name', data.name);
            this.model.set('pic', data.pic);
            this.model.set('players', data.users);
        },
    });

    return UserMeta;

});
