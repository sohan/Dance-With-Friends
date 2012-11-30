define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'arrow',
], function($, _, Backbone, App, Arrow) {
    var Game = App.Game || {};

    Game.Model = Backbone.Model.extend({
        defaults: {
            startTime: new Date().getTime(),
            players: {},
            arrows: {},
            timeMoves: [],
            gameFPS: 30,
            velocity: 20,
        },
        getTimeOffset: function() {
            return new Date().getTime() - this.get('startTime');
        },
    });

    Game.View = Backbone.View.extend({
        el: $('#game-container'),
        initialize: function() {
            this.interval = setInterval($.proxy(this.runGameLoop, this), 1000 / this.model.get('gameFPS'));
            this.arrows = [];
            this.arrows.push(new Arrow.View({
                model: new Arrow.Model({
                    direction: 'l'
                })
            }));
            this.arrows.push(new Arrow.View({
                model: new Arrow.Model({
                    direction: 'r'
                })
            }));
            
            this.model.set('gameHeight', $(this.el).height());
            $(window).resize(function() {
                this.model.set('gameHeight', $(this.el).height());
            }, this);
        },
        runGameLoop: function() {
            var newTime = this.model.getTimeOffset();
            var currentTime = new Date().getTime();

            var forRemoval = [];
            _.each(this.arrows, function(arrow) {
                arrow.updatePosition(currentTime);
                var gameHeight = App.gameInstance.get('gameHeight');
                var pos = arrow.model.get('pos');
                if (pos > gameHeight) {
                    arrow.destroy();
                    forRemoval.push(arrow);
                }
            }, this);
            _.each(forRemoval, function(arrow) {
                delete this.arrows[_.indexOf(this.arrows, arrow)];
            }, this);
        },
        render: function() {
        },
    });

    Game.initialize = function() {
        /*
         * key: seconds
         * value: list of arrows that should appear at that time
         * */
        var timeMoves = {
            5.0: ['l'],
            7.5: ['r'],
            10.0: ['d'],
        }

        var game = new Game.Model({
            //velocity: pixels per second
            timeMoves: timeMoves,
            velocity: 1000,
        });
        var gameView = new Game.View({
            model: game
        });
        App.gameInstance = game;
    }

    return Game;
});
