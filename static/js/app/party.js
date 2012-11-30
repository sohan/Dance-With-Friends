define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'socket',
], function($, _, Backbone, App, Socket) {
    var DanceParty = App.DanceParty || {};

    DanceParty.PersonModel = Backbone.Model.extend({
        
    });

    DancePart.PersonView = Backbone.View.extend({
        tagName: 'div',
        className: 'person',
        template: _.template($('#template-person').html()),
        render: function() {
             
        }
    });

    DanceParty.Collection = Backbone.Collection.extend({
        model: DanceParty.PersonModel,
        initialize: function() {
        },
    });

});
