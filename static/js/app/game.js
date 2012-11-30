define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'arrow',
  'songMeta',
  'userMeta',
  'socket',
  'bufferloader',
], function($, _, Backbone, App, Arrow, SongMeta, UserMeta, Socket) {
    var Game = App.Game || {};

    Game.Model = Backbone.Model.extend({
        defaults: {
            startTime: new Date().getTime(),
            currentTime: undefined,
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
            $(document).on('keydown', $.proxy(this.detectMove, this));
            this.arrows = [];            

            $(window).resize($.proxy(function() {
                this.model.set('gameHeight', $(this.el).height());
                this.model.set('timeToTop', this.model.get('gameHeight')/this.model.get('velocity'));
                this.model.set('bufferZoneTime', this.model.get('gameHeight')/this.model.get('velocity'));
            }, this));
            $(window).resize();
        },
        detectMove: function(e) {
            var hit_box = '';
            if (e.which == 72) { //h
                hit_box = 'left';
            } else if (e.which == 74) { //j
                hit_box = 'down';
            } else if (e.which == 75) { //k
            } else if (e.which == 76) { //l
                hit_box = 'right';
            }

            this.processMove(hit_box, this.model.get('currentTime'));

            
        },
        processMove: function(move, currentTime) {
            if (move) {
                this.showMove(move, currentTime);
                _.each(this.arrows, function(arrow) {
                    if (move == arrow.model.get('direction')) {
                        //TODO: check if timestamp is based off the right vars
                        var timeDiff = Math.abs(arrow.model.get('finalTimestamp') - currentTime);

                        var score = this.scoreMove(timeDiff);
                        if (score > 0) {
                            console.log(timeDiff);
                            this.updateScore(score, arrow);
                        }

                       
                    }
                }, this);
            }

            var el = $('#'+move+'-spot-arrow');
            el.addClass(move+'-hit');
            var intervalPointer;
            intervalPointer = setInterval(function() {
                el.removeClass(move+'-hit');
                clearInterval(intervalPointer);
            }, 200);
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
            
            if (timeDiff < 50) {
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
                if (pos < -500 ) {
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

            this.model.set('currentTime', currentTime);
        },
        render: function() {
        },
    });

    Game.initialize = function(user) {

        var AudioContext = (
            window.AudioContext ||
                window.webkitAudioContext ||
                null
        );

        initializeMedia = function() {
            if (!AudioContext) {
                alert("AudioContext not supported!");
            }
            else {
                loadSounds();
            }

            // Load our vision system from the namespace provided in vision.js
            vision.startVision($, sensor_hit);
        }

        sensor_hit = function(r) {
            if (r == 0) {
                App.gameView.processMove('left', App.gameInstance.get('currentTime'));
            } else if (r == 1) {
                App.gameView.processMove('down', App.gameInstance.get('currentTime'));
            } else if (r == 2) {
                App.gameView.processMove('right', App.gameInstance.get('currentTime'));
            }
        }

        loadSounds = function() {
            soundContext = new AudioContext();
            bufferLoader = new BufferLoader(soundContext,
                                            [
                                                'static/songs/gangamstyle.mp3',
                                            ],
                                            bootstrapGame
                                           );
            bufferLoader.load();
        }

        var bootstrapGame = function() {
            var pingCounter = 0;
            var delay = -1;
            var requestTimes = [0,0,0,0,0]
            var responseTimes = [0,0,0,0,0]
            //TODO: start loading
            Socket.socket.on('ping', function(data){
                responseTimes[data.num] = new Date().getTime();
                pingCounter++;
                if(pingCounter >= 5){
                    var totalDelay = 0;
                    for(var i = 0; i < 5; i++){
                        totalDelay += responseTimes[i] - requestTimes[i];
                    }
                    delay = totalDelay / (5*2);
                    //TODO: end loading
                    Socket.socket.removeListener('ping',  this);

                    App.gameInstance.set('delay', delay);
                }
            });
            var getDelay = function() {
                for(var i = 0; i < 5; i++){
                    requestTimes[i] = new Date().getTime();
                    Socket.socket.emit('ping', {num: i});
                }
            }
            getDelay();
        }

        var initGame = function() {
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
            App.gameView = gameView;
            App.user = user;
        }

        initGame();

        initializeMedia();
    }

    return Game;
});
