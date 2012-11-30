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
            timestamp: new Date().getTime(),
            direction: '',
            pos: 0.0,
        },
    });

    Arrow.View = Backbone.View.extend({
        el: $('#arrows-container'),
        rightArrows: $('#right-arrows'),
        upArrows: $('#up-arrows'),
        downArrows: $('#down-arrows'),
        leftArrows: $('#left-arrows'),
        template: _.template($('#template-arrow').html()),
        initialize: function() {
            this.render();
        },
        updatePosition: function(currentTime) {
            var vel = App.gameInstance.get('velocity');
            var timeElapsed = currentTime - this.model.get('timestamp');
            var y = timeElapsed * vel / 1000;
            //TODO: dyanmic velocity based on current pos

            this.model.set('pos', y);
            this.renderedEl.css('bottom', y + 'px');
        },
        destroy: function() {
            this.model.destroy();
            this.renderedEl && this.renderedEl.remove();
            this.model.off(null, null, this);
            this.off(null, null, this);
        },
        render: function() {
            var arrowContainer, klass;
            switch (this.model.get('direction')) {
                case 'l': 
                    arrowContainer = this.leftArrows; 
                    klass = 'left';
                    break;
                case 'u': 
                    arrowContainer = this.upArrows; 
                    klass = 'up';
                    break;
                case 'd': 
                    arrowContainer = this.downArrows; 
                    klass = 'down';
                    break;
                case 'r': 
                    arrowContainer = this.rightArrows; 
                    klass = 'right';
                    break;
            }
            var dict = this.model.toJSON();
            dict.klass = klass;
            var html = this.template(dict);
            this.renderedEl = $(html);
            this.renderedEl.css('bottom', this.model.get('pos') +'px');
            arrowContainer.append(this.renderedEl);
        },
    });

    return Arrow;
});
