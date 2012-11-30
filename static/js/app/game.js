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
            players: {},
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
            this.arrows = [];            
            
            this.model.set('gameHeight', $(this.el).height());
            $(window).resize(function() {
                this.model.set('gameHeight', $(this.el).height());
            }, this);
        },
        runGameLoop: function() {
            var currentTime = this.model.getTimeOffset();

            // Add arrows within the timestamp buffer
            var stop = false;
            var currentSong = this.model.get('currentSong');
            console.log(currentTime)
            while(!stop){
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
            // Check for removal
            var forRemoval = [];
            _.each(this.arrows, function(arrow) {
                arrow.updatePosition(currentTime);
                var pos = arrow.model.get('pos');
                if (pos < 0) {
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

        var game = new Game.Model({
        });
        var gameView = new Game.View({
            model: game
        });
        App.gameInstance = game;

        //Setup times to top and buffer
        game.set('timeToTop', game.get('gameHeight')/game.get('velocity'));
        game.set('bufferZoneTime', game.get('gameHeight')/game.get('velocity'));

    }

    return Game;
});
