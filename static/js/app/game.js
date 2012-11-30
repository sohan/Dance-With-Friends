define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'arrow',
  'songMeta',
  'userMeta',
  'socket',
], function($, _, Backbone, App, Arrow, SongMeta, UserMeta, Socket) {
    var Game = App.Game || {};

    Game.Model = Backbone.Model.extend({
        defaults: {
            startTime: new Date().getTime(),
            players: {}, //id to player state
            arrows: {},
            gameFPS: 30,
            velocity: .1,
            timeToTop: 5000,
            bufferZoneTime: 3000,
            currentSong: SongMeta['Gangam Style'],
            songIndex: 0 // The current index in the song stamp list 
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
            this.arrows = [];            
            
            $(window).resize($.proxy(function() {
                this.model.set('gameHeight', $(this.el).height());
                this.model.set('timeToTop', this.model.get('gameHeight')/this.model.get('velocity'));
                this.model.set('bufferZoneTime', this.model.get('gameHeight')/this.model.get('velocity'));
            }, this));
            $(window).resize();
        },
        detectMove: function(e) {
            var currentTime = this.model.getTimeOffset();
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
            this.processMove(move, currentTime);
        },
        processMove: function(move, currentTime) {
            if (move) {
                this.showMove(move, currentTime);
                _.each(this.arrows, function(arrow) {
                    if (move == arrow.model.get('direction')) {
                        var timeDiff = arrow.model.get('finalTimestamp') - currentTime;
                        var score = this.scoreMove(timeDiff);
                        if (score > 0) {
                            this.updateScore(score, arrow);
                        }
                    }
                }, this);
            }
        },
        showMove: function(move, currentTime) {
            Socket.doMove(move, currentTime);
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
            } else if (timeDiff < 50) {
                return 4;
            } else if (timeDiff < 100) {
                return 3;
            } else if (timeDiff < 200) {
                return 2;
            } else if (timeDiff < 300) {
                return 1;
            } else {
                return 0;
            }
        },
        updateScore: function(score, arrow) {
            App.user.set('score', App.user.get('score') + score * 1000);
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
                var pos = arrow.model.get('pos');
                if (pos < 0) {
                    arrow.destroy();
                    forRemoval.push(arrow);
                }
            }, this);
            this.removeArrows(forRemoval);
        },
        addNewArrows: function(currentTime) {
            // Add arrows within the timestamp buffer
            var stop = false;
            var currentSong = this.model.get('currentSong');
            while(!stop) {
                var songIndex = this.model.get('songIndex');
                if (songIndex >= currentSong.length)
                    break;
                // If the timestamp for the arrow puts it on our screen
                if (currentSong[songIndex].timestamp <
                        this.model.get('timeToTop')
                         + this.model.get('bufferZoneTime')
                         + currentTime) {
                    console.log('added arrow ', currentSong[songIndex].type);
                    this.arrows.push(new Arrow.View({
                        model: new Arrow.Model({
                            direction: currentSong[songIndex].type,
                            startTimestamp: currentTime,
                            finalTimestamp: currentSong[songIndex].timestamp
                        })
                    }));

                    this.model.set('songIndex', songIndex+1);

                } else { //Otherwise we stop because none past it will be true either
                    stop = true;
                }
            
            }
        },

        runGameLoop: function() {
            var newTime = this.model.getTimeOffset();
            var currentTime = this.model.getTimeOffset();
            this.addNewArrows(currentTime);
            this.updateArrows(currentTime);
        },
        render: function() {
        },
    });

    Game.initialize = function(user) {
        /*
         * key: seconds
         * value: list of arrows that should appear at that time
         * */

        var game = new Game.Model({
        });
        Socket.startGame();
        var gameView = new Game.View({
            model: game
        });
        var user = new UserMeta.Model();
        var userView = new UserMeta.View({
            model: user
        });
        App.gameInstance = game;
        App.user = user;
    }

    return Game;
});
