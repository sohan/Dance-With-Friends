define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'arrow',
  'songMeta',
], function($, _, Backbone, App, Arrow, SongMeta) {
    var Game = App.Game || {};

    Game.Model = Backbone.Model.extend({
        defaults: {
            startTime: new Date().getTime(),
            players: {}, //id to player state
            arrows: {},
            timeMoves: [],
            gameFPS: 30,
            velocity: 20,
            timeToTop: 5.0,
            bufferZoneTime: 3.0,
            score: 0,
        },
        getTimeOffset: function() {
            return new Date().getTime() - this.get('startTime');
        },
    });

    Game.View = Backbone.View.extend({
        el: $('#game-container'),
        initialize: function() {
            this.interval = setInterval($.proxy(this.runGameLoop, this), 1000 / this.model.get('gameFPS'));
            $(document).on('keyup', $.proxy(this.detectMove, this));
            //TODO: change arrows into a Backbone collection
            this.arrows = [];
            this.arrows.push(new Arrow.View({
                model: new Arrow.Model({
                    direction: 'l',
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
        detectMove: function(e) {
            var currentTime = new Date().getTime();
            var move = null;
            if (e.which == 72) { //h
                move = 'l';
            } else if (e.which == 74) { //j
                move = 'd';
            } else if (e.which == 75) { //k
                move = 'u';
            } else if (e.which == 76) { //l
                move = 'r';
            }
            processMove(move);
        },
        processMove: function(move) {
            if (move) {
                _.each(this.arrows, function(arrow) {
                    if (move == arrow.model.get('direction')) {
                        //TODO: check if timestamp is based off the right vars
                        var timeDiff = arrow.model.get('finalTimestamp') - (currentTime - arrow.model.get('timestamp'));
                        var score = this.scoreMove(timeDiff);
                        if (score > 0) {
                            this.updateScore(score, arrow);
                        }
                    }
                }, this);
            }
        },
        scoreMove: function(timeDiff) {
            //time diff is in milliseconds
            /*
             * returns a score from 0->4
             * 0: ignore move
             * 1: bad
             * 2: good
             * 3: awesome
             * 4: perfect
             * */
            if (timeDiff < 0) {
                return 0;
            } else if (timeDiff < 100) {
                return 4;
            } else if (timeDiff < 250) {
                return 3;
            } else if (timeDiff < 500) {
                return 2;
            } else if (timeDiff < 1000) {
                return 1;
            } else {
                return 0;
            }
        },
        updateScore: function(score, arrow) {
            this.model.set('score', this.model.get('score') + score * 1000);
            arrow.glow();
            //TODO: show popup with score word
            //TODO: highlight the arrow or something
        },
        removeArrows: function(forRemoval) {
            _.each(forRemoval, function(arrow) {
                delete this.arrows[_.indexOf(this.arrows, arrow)];
            }, this);
        },
        updateArrows: function(currentTime) {
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
            this.removeArrows(forRemoval);
        },
        runGameLoop: function() {
            var newTime = this.model.getTimeOffset();
            var currentTime = new Date().getTime();
            this.updateArrows(currentTime);
        },
        render: function() {
        },
    });

    Game.initialize = function() {
        /*
         * key: seconds
         * value: list of arrows that should appear at that time
         * */

        var game = new Game.Model({
            //velocity: pixels per second
            timeMoves: SongMeta['Gangam Style'],
            velocity: 100,
        });
        var gameView = new Game.View({
            model: game
        });
        App.gameInstance = game;
    }

    return Game;
});
