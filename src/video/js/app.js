(function() {

    function hasGetUserMedia() {
        // Note: Opera builds are unprefixed.
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                  navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }

    if (hasGetUserMedia()) {
        $("#info").hide();
        $("#message").show();
    } else {
        $("#info").show();
        $("#message").hide();
        $("#video-demo").show();
        $("#video-demo")[0].play();
        return;
    }

    var webcamError = function(e) {
        alert('Webcam error!', e);
    };

    var video = $('#webcam')[0];

    if (navigator.getUserMedia) {
        navigator.getUserMedia({audio: false, video: true}, function(stream) {
            video.src = stream;
            initialize();
        }, webcamError);
    } else if (navigator.webkitGetUserMedia) {
        navigator.webkitGetUserMedia({audio: true, video: true}, function(stream) {
            video.src = window.webkitURL.createObjectURL(stream);
            initialize();
        }, webcamError);
    } else {
        //video.src = 'somevideo.webm'; // fallback.
    }

    var AudioContext = (
        window.AudioContext ||
            window.webkitAudioContext ||
            null
    );

    var arrowPosX = [150,300,450];
    var arrowPosY = [350,420,350];

    var timeOut, lastImageData;
    var canvasSource = $("#canvas-source")[0];
    var canvasBlended = $("#canvas-blended")[0];

    var contextSource = canvasSource.getContext('2d');
    var contextBlended = canvasBlended.getContext('2d');

    var soundContext;
    var bufferLoader;
    var notes = [];

    var timesHit = 0;
    var lastHits = [1000,1000,1000];
    var prevAvgs = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];

    // mirror video
    contextSource.translate(canvasSource.width, 0);
    contextSource.scale(-1, 1);

    var c = 5;

    function initialize() {
        if (!AudioContext) {
            alert("AudioContext not supported!");
        }
        else {
            loadSounds();
        }
    }

    function loadSounds() {
        soundContext = new AudioContext();
        bufferLoader = new BufferLoader(soundContext,
                                        [
                                            'sounds/note1.mp3',
                                            'sounds/note2.mp3',
                                            'sounds/note3.mp3',
                                        ],
                                        finishedLoading
                                       );
        bufferLoader.load();
    }

    function finishedLoading(bufferList) {
        for (var i=0; i<3; i++) {
            var source = soundContext.createBufferSource();
            source.buffer = bufferList[i];
            source.connect(soundContext.destination);
            var note = {
                note: source,
                ready: true,
                visual: $("#arrow" + i)[0]
            };
            note.area = {x:arrowPosX[i], y:arrowPosY[i],
                         width:note.visual.width, height:44};
            notes.push(note);
        }
        start();
    }

    function playSound(obj) {
        if (!obj.ready) return;
        var source = soundContext.createBufferSource();
        source.buffer = obj.note.buffer;
        source.connect(soundContext.destination);
        source.noteOn(0);
        obj.ready = false;
        // throttle the note
        setTimeout(setNoteReady, 400, obj);
    }

    function setNoteReady(obj) {
        obj.ready = true;
    }

    function start() {
        $(canvasSource).show();
        //$(canvasBlended).show();
        $("#arrows").show();
        $("#message").hide();
        $("#description").show();
        update();
    }

    function update() {
        drawVideo();
        blend();
        checkAreas();
        updateCounter();
        updateLastHits();
        timeOut = setTimeout(update, 1000/60);
    }

    function drawVideo() {
        contextSource.drawImage(video, 0, 0, video.width, video.height);
    }

    function updateCounter() {
        document.getElementById("hitcounter").innerHTML = timesHit;
    }

    function updateLastHits() {
        for(var i = 0; i < 3; i++) {
            lastHits[i]++;
        }
    }

    function blend() {
        var width = canvasSource.width;
        var height = canvasSource.height;
        // get webcam image data
        var sourceData = contextSource.getImageData(0, 0, width, height);
        // create an image if the previous image doesn’t exist
        if (!lastImageData) lastImageData = contextSource.getImageData(0, 0, width, height);
        // create a ImageData instance to receive the blended result
        var blendedData = contextSource.createImageData(width, height);
        // blend the 2 images
        differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
        // draw the result in a canvas
        contextBlended.putImageData(blendedData, 0, 0);
        // store the current webcam image
        lastImageData = sourceData;
    }

    function fastAbs(value) {
        // funky bitwise, equal Math.abs
        return (value ^ (value >> 31)) - (value >> 31);
    }

    function threshold(value) {
        return (value > 0x15) ? 0xFF : 0;
    }

    function difference(target, data1, data2) {
        // blend mode difference
        if (data1.length != data2.length) return null;
        var i = 0;
        while (i < (data1.length * 0.25)) {
            target[4*i] = data1[4*i] == 0 ? 0 : fastAbs(data1[4*i] - data2[4*i]);
            target[4*i+1] = data1[4*i+1] == 0 ? 0 : fastAbs(data1[4*i+1] - data2[4*i+1]);
            target[4*i+2] = data1[4*i+2] == 0 ? 0 : fastAbs(data1[4*i+2] - data2[4*i+2]);
            target[4*i+3] = 0xFF;
            ++i;
        }
    }

    function differenceAccuracy(target, data1, data2) {
        if (data1.length != data2.length) return null;
        var i = 0;
        while (i < (data1.length * 0.25)) {
            var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
            var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
            var diff = threshold(fastAbs(average1 - average2));
            target[4*i] = diff;
            target[4*i+1] = diff;
            target[4*i+2] = diff;
            target[4*i+3] = 0xFF;
            ++i;
        }
    }

    function getPrevAvg(r) {
        var s = 0;
        for (var i = 0; i < 5; i++) {
            s += prevAvgs[r][i];
        }
        return s / 5;
    }

    function checkAreas() {
        // loop over the note areas
        for (var r=0; r<3; ++r) {
            // get the pixels in a note area from the blended image
            var blendedData = contextBlended.getImageData(notes[r].area.x, notes[r].area.y, notes[r].area.width, notes[r].area.height);
            var i = 0;
            var average = 0;
            // loop over the pixels
            while (i < (blendedData.data.length * 0.25)) {
                // make an average between the color channel
                average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
                ++i;
            }
            // calculate an average between of the color values of the note area
            average = Math.round(average / (blendedData.data.length * 0.25));
            prevAvg = getPrevAvg(r);
            if (prevAvg > 10 && average < 2 && lastHits[r] > 10) {
                // over a small limit, consider that a movement is detected
                // play a note and show a visual feedback to the user
                lastHits[r] = 0;
                playSound(notes[r]);
                notes[r].visual.style.display = "block";
                $(notes[r].visual).fadeOut();
                timesHit++;
            }
            prevAvgs[r].push(average);
            prevAvgs[r].shift();
        }
    }


})();
