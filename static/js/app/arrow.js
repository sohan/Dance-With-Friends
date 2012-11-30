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
            startTimestamp: undefined,
            direction: undefined,
            pos: 0.0,
            finalTimestamp: undefined // This should be overwritten
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
            // Set the initial position of the arrow to hit at the correct time
            var timeToHit = this.model.get('finalTimestamp')
                    - this.model.get('startTimestamp');
            var vel = App.gameInstance.get('velocity');

            this.model.set('pos', timeToHit * vel);
            this.model.set('startPos', timeToHit * vel);
            this.render();
        },
        updatePosition: function(currentTime) {
            var vel = App.gameInstance.get('velocity');
            var timeLeft = this.model.get('finalTimestamp') - currentTime;
            console.log(currentTime)
            y = vel * timeLeft;

            this.model.set('pos', y);

            // Shift the arrows up so the centers are the hit point
            y -= parseInt(this.renderedEl.css('height')) / 2;
            this.renderedEl.css('top', y + 'px');
        },
        destroy: function() {
            this.model.destroy();
            this.renderedEl && this.renderedEl.remove();
            this.model.off(null, null, this);
            this.off(null, null, this);
        },
        glow: function() {
            var el = this.renderedEl;
            el.addClass('glow');
            /*setInterval(function() {
                el && el.removeClass('glow');
            }, 500);*/
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
            this.renderedEl.css('top', this.model.get('pos') +'px');
            arrowContainer.append(this.renderedEl);
        },
    });

    return Arrow;
});
