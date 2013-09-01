/*
rashomon
copyleft 2012
*/
var Rashomon = {
    manifestLoc: "davis.json",
    manifest: {},
    videos: [],
    photos: [],
    phometa: [],
    photoDuration: 10,
    loaded: 0,
    looping: false,
    startLoop: 0,
    endLoop: 0,
    delayFixed: 0,
    fulldur: 0,
    preoffset: 0,
    earliest: new Date(),
    timeline: "",
    videosToDisplay: "",
    colorList: ["red", "#E88C03", "#CAEB47", "#1C9928", "#4789EB", "#60f", "magenta", "Khaki", "turquoise"],
    validDate: function (item) {
        //makes sure date isn't from 1904 or 1946 (ENIAC) or sometime way before videos existed
        if (item.mcDate > 2000) {
            return item.mcDate;
        } else {
            return item.fmDate;
        }
    },
    getVidById: function (id) {
        id = parseInt(id,10);
        var h = {};
        $(this.videos).each(function (k,v) {
            if (v.id === id) {
                h = this;
            }

        });
        return h;
    },
    getPhoById: function (id) {
        id = parseInt(id,10);
        var h = {};
        $(this.photos).each(function () {
            if (this.id === id) {
                h = this;
            }

        });
        return h;
    },


    extendBefore: function (sec) {
        this.fulldur += sec;
        this.preoffset += sec;
        this.startLoop += sec;
        this.earliest = moment(this.earliest).add('s', sec).toDate();
        Rashomon.setupLoop(Rashomon.startLoop, Rashomon.endLoop);
        $(this.videos).each(function () {
            this.changeStuff(this.offset + sec);
        });


    },
    makeDraggable: function () {

        $(".vidtime, .photime").draggable({
            start: function () {
                $(this).removeClass('moveTransition');
            },
            stop: function () {
                $(this).addClass('moveTransition');
                var test = $(this).attr('data-id');
                
                $(this).css("width", widthpct);
                var aVid = Rashomon.getVidById(test);
                var left = $(this).position().left;
                var widthpct = $(this).css("width");
                aVid.changeStuff(Rashomon.offset2time(left));
                
            },
            drag: function (event, ui) {
                
             
                if (ui.position.left <= 0) {
                    Rashomon.extendBefore(1);
                } else if ($(this).parent().width() - (ui.position.left + $(this).width()) < 5) {
                    Rashomon.extendAfter(5);
                }
            },
            containment: "parent",
            cursor: "-moz-grabbing pointer"
        });
        

    },
    extendAfter: function (sec) {
        this.fulldur += sec;
        $(this.videos).each(function () {
            this.drawVidtimes();
        });
    },
    loadFullscreen: function (id) {
        //console.log("FS for id " + id);
        var video = $("#video" + id);
        var ctime = Popcorn("#video" + id).currentTime();
        var sources = video.children();

        if (!sources) {
            alert("Something wrong with sources for this video");
        }

        Rashomon.timeline.pause();

        //$('body').css('overflow', "hidden");
        $('#fullscreen').fadeIn("slow");
        $("html, body").scrollTop(0);
        $("body").css("overflow", "hidden");
        var videotag = $("<video/>", {
            'id': 'fsvid',
            "controls": true
        }).appendTo('#fsvidholder');
        Rashomon.videos[id].webm.appendTo(videotag);
        Rashomon.videos[id].mp4.appendTo(videotag);
        $("#fsvid").css("left", $(window).width() / 2 - $("#fsvid").width() / 2);
        var fspop = Popcorn("#fsvid");
        fspop.on("loadedmetadata", function () {
            $("#fsvid").css("left", $(window).width() / 2 - $("#fsvid").width() / 2);
            fspop.pause(ctime);
            $("#xbox").css({
                "top": 5,
                "left": $("#fsvid").offset().left + $("#fsvid").width() - 20
            });
        });
        fspop.on("canplay", function () {
            $("#fsvid").css("left", $(window).width() / 2 - $("#fsvid").width() / 2);
            $("#fsvid").css("opacity", 1);
        });
    },
    offset2time: function (offset) {
        var pct = offset / $('#maintimeline').width();
        var tldur = Rashomon.fulldur;
        return (tldur * pct);
    },
    getPct: function (offset) {
        return (offset / $("#maintimeline").width() * 100);
    },
    //initiates loop, times determined by media or media fragment uri
    setupLoop: function (start, finish) {
        var startPos = Rashomon.getOffset(start);
        var finishPos = Rashomon.getOffset(finish);
        var startPct = Rashomon.getPct(startPos);
        var finishPct = Rashomon.getPct(finishPos);
        Rashomon.looping = true;
        Rashomon.startLoop = start;
        Rashomon.endLoop = finish;
        Rashomon.timeline.cue(Rashomon.endLoop, function () {
            Rashomon.timeline.play(Rashomon.startLoop);
        });
        var tldur = Rashomon.fulldur;

        //add movers to timeline, set up slider
        var leftMover = $("<div/>", {
            "id": "leftMover",
            "class": "mover ui-slider-handle",
            "text": "\u25bc"
        }).appendTo("#maintimeline");
        var rightMover = $("<div/>", {
            "id": "rightMover",
            "class": "mover ui-slider-handle",
            "text": "\u25bc"
        }).appendTo("#maintimeline");
        $(".mover").css({
            "background": "transparent",
            "border": "0",
            "margin-left": "-8px",
            "margin-top": "-12px",
            "color": "black",
            "cursor": "pointer"
        });
        $(".ui-slider-range").css({
            "position": "relative",
            "height": "100%",
            "border": "0",
            "border-radius": 0,
            "background": "url('images/reel.png') top left repeat-x"
        });
        $("#maintimeline").css({
            "border-radius": "0"
        });
        //make the loop selector
        $("#maintimeline").slider({
            range: true,
            min: 0,
            max: Rashomon.fulldur,
            values: [start, finish],
            change: function (event, ui) {
                var value = ui.values;
                Rashomon.startLoop = ui.values[0];
                Rashomon.endLoop = ui.values[1];
                var t = $.url().attr("query", "t=18,19");
                var url = $.url().attr('source').replace(t, "");
                //console.log(url);
                url = "?t=" + ui.values[0] + "," + (ui.values[1] - ui.values[0]);
                history.pushState(null, null, url);
                //console.log(url);

                Rashomon.timeline.cue("loop", value[1], function () {
                    //console.log("reached end of loop");
                    if (!Rashomon.timeline.media.paused) {
                        //console.log("adjusting");
                        Rashomon.timeline.currentTime(value[0]);
                    }
                }); //end cue
                //move if currentTime is out of bounds
                //console.log(value);
                if (Rashomon.timeline.currentTime() < value[0] || Rashomon.timeline.currentTime() > value[1]) {
                    Rashomon.timeline.currentTime(value[0]);
                    if (Rashomon.timeline.media.paused) {
                        $(Rashomon.videos).each(function () {
                            this.seekPaused();
                        });
                    } //end if 
                } //end if
            } //end slider
        }).css({
            "border": "0",
            "border-bottom": "1px solid #666"
        });

        //handles the cues
        var timepos = $("#timepos").position().left;
        //end setuploop
    },
    //formats exifTool's dates to something javascript Date object can use
    formatDate: function (exifDate) {
        if (!exifDate) {
            return false;
        }
        var momentDate = moment(exifDate, "YYYY:MM:DD HH:mm:ss Z");
        return momentDate.toDate();
        //input format looks like "YYYY:MM:DD HH:MM:SS:mm-05:00" (-05:00 is timezone)

    },
    //converts seconds to hh:mm:ss
    sec2hms: function (time) {
        var totalSec = parseInt(time, 10);
        var hours = parseInt(totalSec / 3600, 10) % 24;
        var minutes = parseInt(totalSec / 60, 10) % 60;
        var seconds = parseInt(totalSec % 60, 10);
        return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    },
    //deals with various duration metadata standards
    formatDuration: function (duration) {
        if (!duration) {
            return false;
        }
        var dur;
        //because having different cameras output duration in the same format would be crazy!
        if (duration.indexOf(":") !== -1) {
            //return Popcorn.util.toSeconds(duration)
            var split = duration.split(":");
            var hr = split[0];
            var min = split[1];
            var sec = +split[2];
            dur = (hr * 60 * 60) + (min * 60) + sec;
            return dur;
        } else if (duration.indexOf("s") !== -1) {
            var seconds = duration.split(".");
            dur = seconds[0];
            return dur;
        } else {
            console.log("Some weird duration, couldn't format");
        }
    },
    //coordinate conversion for GPS metadata
    convertCoord: function (coord) {
        var split = coord.split(" ");
        if (split[1] === "S" || split[1] === "W") {
            return split[0] * -1;
        } else {
            return split[0];
        }
    },
    isEven: function (someNumber) {
        return (someNumber % 2 === 0) ? "even" : "odd";
    },
    finalize: function () {
        $("#loading").hide();
        $(this.videos).each(function () {
            this.pp.off("canplaythrough");
            this.pp.off("suspend");
            this.setupVid();
        });
        $(this.photos).each(function () {
            this.setupPho();
        });
        $("#timepos").on("mousedown", function () {
            if (!Rashomon.timeline.media.paused) {
                Rashomon.resume = true;
            }
            Rashomon.timeline.pause();

        });
        $(Rashomon.videos).each(function () {
            this.seekPaused();

        });
        //console.log("Finished setting up");
        $("#timeDisplay").fadeIn();
        $("#timeDisplay").css({
            "margin-left": "-" + $("#timeDisplay").width() / 2 + "px"
        });
        var newheight = $("#maintimeline").offset().top + $("#maintimeline").height() - $(".lines").first().offset().top;
        //set up time position draggable events
        $("#timepos").draggable({
            "containment": "parent",
            "axis": "x",
            "start": function (event, ui) {
                if (!Rashomon.timeline.media.paused) {
                    Rashomon.resume = true;
                }
                Rashomon.timeline.pause();

            },
            "drag": function (event, ui) {
                console.log(ui.position.left);
                $("#timeDisplay").css({
                    left: ui.position.left
                });
                var pct = ui.position.left / $('#maintimeline').width();
                $("#timeDisplay").text(Rashomon.sec2hms(Rashomon.fulldur * pct));

            },
            "stop": function (event, ui) {

                var pct = $("#timepos").position().left / $('#maintimeline').width();
                var tldur = Rashomon.fulldur;
                Rashomon.timeline.currentTime(tldur * pct);
                if (Rashomon.resume) {
                    Rashomon.timeline.play();
                    Rashomon.resume = false;
                } else {
                    $(Rashomon.videos).each(function () {
                        this.seekPaused();
                    });
                }

            }
        });
        //not fond of this, but it seems to keep playhead from locking.  using better event than metadataloaded could help?
        $("#timepos").css({
            "height": newheight,
            "cursor": "pointer"
        });
        $("#timepos").show();
        $(".vidnum, .phonum").addClass("vidactive");
        var url = $.url();
        //detects for Media Fragment uri (?t=15,5 returns a 5 second loop starting at 15 seconds)
        if (url.attr("query")) {
            var frag = url.attr("query");
            frag.replace("t=", "");
            var fragtemp = frag.split("=");
            fragtemp = fragtemp[1].split(",");
            var loopStart = parseInt(fragtemp[0], 10);
            var loopEnd = parseInt(loopStart + parseInt(fragtemp[1], 10), 10);
            Rashomon.setupLoop(loopStart, loopEnd);
        } else {
            Rashomon.setupLoop(0, Rashomon.fulldur - 5);
        }
        
        Rashomon.setupEvents();
        Rashomon.timeline.play(Rashomon.startLoop);

    },
    //sets up the timeline element and loads each video, determines timescope based on its contents
    setupTimeline: function (duration) {
        $("<div/>", {
            "id": "loading",
            "text": "Loading..."
        }).css({
            "position": "absolute",
            "top": "35%",
            "left:": "45%",
            'text-align': 'center',
            "font-size": '3em',
            "color": "black",
            "z-index": "120",
            "width": "auto",
            "height": "auto",
            "margin-left": "300px",
            "background": 'rgba("255,255,255,0.73")',
            "text-shadow": "3px 5px 5px #666"
        }).appendTo("#vidlines");
        console.log("Setting up timeline.");
        Popcorn.player("baseplayer");
        this.timeline = Popcorn.baseplayer("#maintimeline");
        $("#eventTitle").text(Rashomon.eventName);
        Rashomon.timeline.cue("loop");
        //setup photos
        $(Rashomon.photos).each(function () {
            this.buildPhotoViewer();
        });
        //setup videos
        $(Rashomon.videos).each(function () {
            var id = this.id;
            var vid = this;
            //console.log("building video player " + this.id);
            this.buildVideoPlayer();
            //console.log("built");

            //lower volume
            this.pp.volume(0.33);
            //once metadata has loaded, read video timing/size metadata and add video to timeline

        }); //end each
        var readies = 0;
        $(this.videos).each(function () {
            var thevid = this;
            this.pp.on('suspend', function () {
                //console.log("Vid " + thevid.id + " has suspended.");
                this.currentTime(0.00);
            });
            this.pp.on('canplaythrough', function () {
                //console.log(thevid.id + " is ready.");
                thevid.cpt = 1;
                readies = 0;
                $(Rashomon.videos).each(function () {
                    if (this.cpt) {
                        $("#vidtime" + this.id).css("opacity", 1);
                        readies++;
                    }
                    $("#loading").text("Loading... " + parseInt(readies / Rashomon.videos.length * 100, 10) + "%");
                    if (readies === Rashomon.videos.length) {
                        Rashomon.finalize();
                    }
                });
            });

        }); //end bind
        this.timeline.currentTime(0); //Start at beginning of timeline, 
        this.fulldur = duration; // end of final video

        //When timeline plays... 
        this.timeline.on("play", function () {
            //make sure it is within the loop selection
            if (Rashomon.timeline.currentTime() < Rashomon.startLoop || Rashomon.timeline.currentTime() > Rashomon.endLoop) {
                Rashomon.timeline.currentTime(Rashomon.startLoop);
            }
            //toggle buttons
            $("#play").hide();
            $("#stop").show();
            //each video checks to see if it should play
            $(Rashomon.videos).each(function () {
                var offset = this.offset;
                var duration = this.pp.duration();
                if (Rashomon.timeline.currentTime() > offset && Rashomon.timeline.currentTime() < offset + duration && !$("#vcontain" + this.id).is(":hidden")) {
                    this.pp.play();
                }
            }); // end videos each
        }); //end play

        //when timeline pauses...
        this.timeline.on("pause", function () {
            //toggle buttons
            $("#play").show();
            $("#stop").hide();
            //pause all videos (no need to check if already paused)
            $(Rashomon.videos).each(function () {
                this.pp.pause(Rashomon.timeline.currentTime() - this.offset);
            });
        }); //end pause


        this.timeline.cue(Rashomon.fulldur - 0.01, function () {
            Rashomon.timeline.pause();
            console.log("pausing");
        }); //end cue
        //play button behavior
        $("#play").click(function () {
            //console.log(Rashomon.timeline.currentTime() + "of " + Rashomon.fulldur);
            if (Rashomon.timeline.currentTime() < Rashomon.fulldur) {
                Rashomon.timeline.play();
            }
        });
        //pause media when stop button is pressed
        $("#stop").click(function () {
            Rashomon.timeline.pause();
        });
        $("#forward").click(function () {
            //reduced so it doesn't trigger the loop rewind
            Rashomon.timeline.pause(Rashomon.endLoop - 0.5);
        });
        $("#rewind").click(function () {
            Rashomon.timeline.currentTime(Rashomon.startLoop);
        });

        //adjust playhead when main timeline moves
        Rashomon.timeline.on("timeupdate", function () {
            if (this.currentTime() > Rashomon.fulldur - 0.5) {
                this.pause(Rashomon.fulldur - 0.5);
            }
            //if you glitch and pass the loop endtime,

            var pct = this.currentTime() / Rashomon.fulldur * 100; // for when we switch to % for window size adjustments
            $("#timeloc, #timeDisplay").text(Rashomon.sec2hms(this.currentTime()));
            $("#timepos, #timeDisplay").css('left', pct + "%");
        });
        //on navtl click, adjust video positions appropriately, obeying play conditions and such
    },
    getOffset: function (time) {
        return $("#maintimeline").width() * time / Popcorn.util.toSeconds(this.fulldur);
    },

    // reads videos from rashomonManifest object, which is created by another hunk of js linked in the html
    setupVideos: function () {
        console.log("Setting up videos");
        var l = Rashomon.vidmeta.length;

        $.each(Rashomon.vidmeta, function (index, item) {
            if (item.duration === null) {
                item.duration = 30;
            }
            Rashomon.videos.push(new video({
                "offset": parseInt(item.offset, 10),
                "duration": parseInt(item.duration, 10),
                "id": index,
                "file": item.name
            }));
            /*
                    var aphoto = Rashomon.photos.push(new photo({
	{
                                "offset": item.vDate.getTime() / 1000,
                                "id": index,
                                "file": item.filename,
                                "meta": itemdata[0]
                            }));
            */
            l--;
            if (Rashomon.videos.length === Rashomon.vidmeta.length) {
                //console.log("Finished last file");

                $.each(Rashomon.videos, function () {
                    var id = this.id;
                    $('#video' + id).attr('data-offset', this.offset);
                    var extend = this.duration + this.offset + 15;
                    if (extend > Rashomon.fulldur) {

                        Rashomon.fulldur = extend;
                        Rashomon.photoDuration = extend / 60;
                        if (Rashomon.photoDuration < 5) {
                            Rashomon.photoDuration = 5;
                        }
                    }

                });

            } // end if
        }); //end getJSON (per item)

    }, //end setupVideos
    setupPhotos: function () {
        console.log("setting up photos");
        var l = Rashomon.phometa.length;
        $.each(Rashomon.phometa, function (index, item) {
            Rashomon.photos.push(new photo({
                "offset": parseInt(item.offset, 10),
                "id": index + Rashomon.videos.length,
                "file": item.name
            }));
            l--;
            if (Rashomon.photos.length === Rashomon.phometa.length) {
                //console.log("Finished last file");

                $.each(Rashomon.photos, function () {
                    //$('#photo' + id).attr('data-offset', this.offset);
                    var extend = this.duration + this.offset + 15;
                    if (extend > Rashomon.fulldur) {
                        Rashomon.fulldur = extend;
                    }

                });

            } // end if

        }); //end each    
    },
    setupEvents: function (){
       
        //console.log("setting events");
        $(".tl").click(function (e) {
            var clickleft = e.pageX - $('#maintimeline').offset().left;
            var pct = clickleft / $('#maintimeline').width();
            Rashomon.timeline.currentTime(tldur * pct);
            if (Rashomon.timeline.media.paused) {
                $(Rashomon.videos).each(function () {
                    this.seekPaused();
                });
            }
        }); //end nav click
        $(".vidnum").click(function(){
            var vidId = $(this).attr("data-id");
            Rashomon.getVidById(vidId).toggleStatus();
        }); // end vidnum click
        $(".phonum").click(function(){
            var phoId = $(this).attr("data-id");
            Rashomon.getPhoById(phoId).toggleStatus();
        }); // end vidnum click
        
    }
        
};
var photo = function (options) {
    this.offset = options.offset;
    this.name = options.file;
    this.file = options.file;
    this.id = options.id;
    this.color = Rashomon.colorList[this.id];
    this.meta = options.meta;
    this.url = Rashomon.mpath + this.file + "_small.jpg";

};

photo.prototype = {
    setupPho: function () {

        var of = this.offset;
        this.drawPhotimes();
        //console.log(pid + ": " + height + " x " + width);
        Rashomon.timeline.rashomonPhoto({
            "id": this.id,
            "timeline": Rashomon.timeline,
            "start": of,
            "end": of + Rashomon.photoDuration
        });

        this.eventId = Rashomon.timeline.getLastTrackEventId();
        //console.log("should fire at " + of + "for 5 seconds");


    },
    showPhoto: function () {
        $("#pContainer" + this.id).show("fast", "linear");
    },
    hidePhoto: function () {
        if ($("#pContainer" + this.id).is(":visible")) {
            $("#pContainer" + this.id).hide("fast", "linear");
        }
    },
    showMeta: function () {
        $("#meta").css("right", "0");
        //console.log(this.meta);
        $("#metadata ul").remove();
        var list = $("<ul/>");
        $("<li/>", {
            text: "Filename : " + this.file
        }).appendTo(list);
        $("<li/>", {
            text: "Start time: " + this.meta.MediaCreateDate
        }).appendTo(list);
        $("<li/>", {
            text: "Offset: " + this.offset + "s"
        }).appendTo(list);

        $("<li/>", {
            text: "..."
        }).appendTo(list);
        list.appendTo("#metadata");
    },
    buildPhotoViewer: function () {

        var pContainer = $("<div/>", {
            id: "pContainer" + this.id,
            'class': 'container'
        }).css("border-color", Rashomon.videos.length + Rashomon.colorList[this.id]);
        var tools = $("<div/>", {
            'class': 'tools'
        });
        var image = $("<img/>", {
            id: "photo" + this.id,
            "class": 'rashomon',
            "data-offset": this.offset,
            "data-id": this.id,
            "src": this.url
        });
        pContainer.appendTo("#videos");
        image.appendTo(pContainer);
        tools.html("<em>" + (this.id + 1) + "</em> <div class='tbuttons'><img src='images/full-screen-icon.png' class='fsbutton' id='fs" + this.id + "'").appendTo(pContainer);
        // <img src='images/info.png' class='showmeta' id='meta" + this.id + "'>")
        //make display function for timeline thing
        //call popcorn plugin

        $("#meta" + this.id).click(function () {
            photo.showMeta();
            return false;
        });



    }, // end viewer
    displayPhoto: function () {
        $("#pholines").show();
        var id = this.id;

        var offset = this.offset;
        var position = Rashomon.getOffset(offset);
        var leftpos = position;
        var pholine = $("<div/>", {
            "class": "pholine " + Rashomon.isEven(id),
            "id": "pholine" + id
        });
        $("<div/>", {
            "class": "phonum",
            "id": "pho" + id,
            "text": +id + 1,
            "data-id": id,
            title: "Click to toggle photo"
        }).appendTo(pholine);
        var photl = $("<div/>", {
            "class": "vidtl",
            "id": "tl" + id,
            "data-id": id
        }).appendTo(pholine);
        $("<img/>", {
            "class": "photime moveTransition",
            "id": "photime" + id,
            "data-id": id,
            "title": this.file,
            "src": this.url
        }).css({
            "left": leftpos / $("#maintimeline").width() * 100 + "%",
            "height": "100%"

        }).appendTo(photl);
        pholine.appendTo("#pholines .lines");
        $('.pholine').tsort({
            attr: 'id'
        });
        this.drawPhotimes();

    },
    toggleStatus: function () {

        if ($("#pho" + this.id).hasClass("vidactive")) {

            $("#pho" + this.id).removeClass("vidactive");
            $("#pho" + this.id).addClass("vidinactive");
            $("#pContainerß" + this.id).hide("fast", "linear");
            $("#photime" + this.id).css("opacity", "0.25");
        } else {
            //turn it on!
            $("#pho" + this.id).addClass("vidactive");
            $("#pho" + this.id).removeClass("vidinactive");
            $("#photime" + this.id).css("opacity", "1");

            //console.log("on " + this.id);
            //console.log(Rashomon.timeline.currentTime() + " between points " + this.offset + " " + (this.offset + this.duration) + "?");
            if (Rashomon.timeline.currentTime() > this.offset && Rashomon.timeline.currentTime() < (this.offset + this.duration)) {
                //console.log("truth");
                $("#pcontain" + this.id).show("fast", "linear");
            }
        }

    },
    drawPhotimes: function () {
        
    }

}; // end photo
var video = function (options) {
    this.offset = parseInt(options.offset, 10);
    this.duration = parseInt(options.duration, 10);
    this.name = options.file;
    this.file = options.file;
    this.id = options.id;
    this.color = Rashomon.colorList[this.id];
    this.meta = options.meta;
    this.eventId = "";
    this.cpt = 0;
};

video.prototype = {
    setupVid: function () {

        var of = this.offset;
        this.duration = this.pp.duration();
        this.drawVidtimes();
        $(this).attr('data-duration', this.duration);
        var height = parseInt(this.pp.media.videoHeight, 10);
        var width = parseInt(this.pp.media.videoWidth, 10);
        //console.log(pid + ": " + height + " x " + width);
        if (height > width) {
            $("#video" + this.id).addClass("vert");
        } else {
            $("#video" + this.id).addClass("hor");
        }
        var offtime = parseInt(Popcorn.util.toSeconds(this.duration) + of, 10);
        Rashomon.timeline.rashomonVideo({
            "vid": this,
            "timeline": Rashomon.timeline,
            "start": of,
            "end": offtime
        });
        this.eventId = Rashomon.timeline.getLastTrackEventId();



    },
    changeStuff: function (offset) {
        this.offset = offset;
        Rashomon.timeline.removeTrackEvent(this.eventId);
        Rashomon.timeline.rashomonVideo({
            "vid": this,
            "timeline": Rashomon.timeline,
            "start": offset,
            "end": offset + this.duration
        });
        this.eventId = Rashomon.timeline.getLastTrackEventId();
        this.drawVidtimes();
    },
    buildVideoPlayer: function () {
        var container = $("<div/>", {
            id: "vcontain" + this.id,
            'class': 'container'
        }).css("border-color", Rashomon.colorList[this.id]);
        var tools = $("<div/>", {
            'class': 'tools'
        });
        var vid = $("<video/>", {
            id: "video" + this.id,
            "class": 'rashomon',
            "data-offset": this.offset,
            "data-id": this.id
        });
        this.webm = $("<source/>", {
            src: Rashomon.mpath + this.file + "_small.webm",
            type: 'video/webm'
        });
        this.mp4 = $("<source/>", {
            src: Rashomon.mpath + this.file + "_small.mp4",
            type: 'video/mp4'
        });
        this.mp4.appendTo(vid);
        this.webm.appendTo(vid);
        container.appendTo($("#videos"));
        vid.appendTo(container);
        //this one has meta button
        //tools.html("<em>" + (this.id + 1) + "</em> <div class='tbuttons'><img src='images/full-screen-icon.png' + class='fsbutton' id='fs" + this.id + "'/> <img src='images/info.png' class='showmeta' id='meta" + this.id + "'>").appendTo(container);
        //this one doesn't
        tools.html("<em>" + (this.id + 1) + "</em> <div class='tbuttons'><img src='images/full-screen-icon.png' + class='fsbutton' id='fs" + this.id + "'/>").appendTo(container);

        $("<div/>", {
            "id": "vidDelay" + this.id,
            "class": "vidDelay"
        }).appendTo(tools);
        this.pp = Popcorn("#video" + this.id);
    },
    //in cases where you seek when main timeline is paused, popcorn does not run 'start' event if seeking from within another in-band event
    seekPaused: function () {
        this.pp.currentTime(Rashomon.timeline.currentTime() - this.offset);
    },
    showVid: function () {
        $("#vcontain" + this.id).show("fast", "linear");
    },
    hideVid: function () {
        this.pp.pause();
        if ($("#vcontain" + this.id).is(":visible")) {
            $("#vcontain" + this.id).hide("fast", "linear");
        }
    },
    showMeta: function () {
        $("#meta").css("right", "0");
        //console.log(this.meta);
        $("#metadata ul").remove();
        var list = $("<ul/>");
        $("<li/>", {
            text: "Filename : " + this.file
        }).appendTo(list);
        $("<li/>", {
            text: "Start time: " + this.meta.MediaCreateDate
        }).appendTo(list);
        $("<li/>", {
            text: "Offset: " + this.offset + "s"
        }).appendTo(list);
        $("<li/>", {
            text: "Duration: " + this.meta.Duration
        }).appendTo(list);
        $("<li/>", {
            text: "..."
        }).appendTo(list);
        list.appendTo("#metadata");
    },
    drawVidtimes: function () {
        var newwidth = Rashomon.getOffset(this.duration) / $("#maintimeline").width() * 100 + "%";
        $("#vidtime" + this.id).css({
            "width": newwidth,
            "left": (Rashomon.getOffset(this.offset) / $("#maintimeline").width() * 100 + "%"),
        });
    },
    toggleStatus: function () {

        if ($("#vid" + this.id).hasClass("vidactive")) {
            //shut it down!
            this.pp.pause();

            $("#vid" + this.id).removeClass("vidactive");
            $("#vid" + this.id).addClass("vidinactive");
            $("#vcontain" + this.id).hide("fast", "linear");
            $("#vidtime" + this.id).css("opacity", "0.25");
        } else {
            //turn it on!
            $("#vid" + this.id).addClass("vidactive");
            $("#vid" + this.id).removeClass("vidinactive");
            $("#vidtime" + this.id).css("opacity", "1");

            if (Rashomon.timeline.currentTime() > this.offset && Rashomon.timeline.currentTime() < (this.offset + this.duration)) {
                $("#vcontain" + this.id).show("fast", "linear");
                if (Rashomon.timeline.media.paused === false) {
                    this.pp.play();
                }
            }
        }

    },
    displayVideo: function () {
        var vid = this;
        var id = this.id;
        var offset = this.offset;
        var position = Rashomon.getOffset(offset);
        var wavimg = 'http://rashomonproject.org/redacted/' + this.name + "_wave.png";
        //console.log("Offset" + this.offset + "data " + $("#video" + id).attr("data-offset"));
        //console.log(offset);
        //todo duration->space, match meta to real meta
        var leftpos = position;
        var vidline = $("<div/>", {
            "class": "vidline " + Rashomon.isEven(id),
            "id": "vidline" + id
        });
        $("<div/>", {
            "class": "vidnum",
            "id": "vid" + id,
            "text": + id + 1,
            "data-id": id,
            title: "Click to toggle video"
        }).appendTo(vidline);
        var vidtl = $("<div/>", {
            "class": "vidtl",
            "id": "tl" + id,
            "data-id": id
        }).appendTo(vidline);
        $("<div/>", {
            "class": "vidtime moveTransition",
            "id": "vidtime" + id,
            "data-id": id,
            "title": this.file
        }).css({
            "left": leftpos / $("#maintimeline").width() * 100 + "%",
            "width": "1px",
            "background-color": Rashomon.colorList[id],
            "background-size": "100% 100%",
            "background-image": "url('" + wavimg + "')",
            "opacity": 0.2

        }).appendTo(vidtl);
        //console.log("Offset for duration " + duration + " is " + Rashomon.getOffset(duration));
        vidline.appendTo("#vidlines .lines");
        $('.vidline').tsort({
            attr: 'id'
        });
        this.drawVidtimes();

        $("#fs" + id).click(function () {
            Rashomon.loadFullscreen(id);
            return false;
        });
        //toggle metadata
        $("#meta" + id).click(function () {
            vid.showMeta();
            return false;
        });
        //on timeline click, seek.


        this.pp.on('timeupdate', function () {
            var delay = (Rashomon.timeline.currentTime() - (vid.offset + this.currentTime())).toFixed(2) * 1000;
            if (!Rashomon.timeline.media.paused && Math.abs(delay) > 1250) {
                this.currentTime(Rashomon.timeline.currentTime() - vid.offset);
                Rashomon.delayFixed++;
            }
            //var syncmsg = "<p>" + id + " " + vid.file + "</p>" + "<p>CurrentTime: " + Rashomon.timeline.currentTime().toFixed(2) + "</p>" + "<p>Video Location: " + (vid.offset + this.currentTime()).toFixed(2) + "</p>" + "<p>Offset: " + vid.offset + "</p>" + "<p>Video Drift: " + delay + "ms</p>";
            //syncmsg = "<p>Video Drift: " + delay + "ms</p>";
            //$("#vidDelay" + id).html(syncmsg);
        }); //end on
    } //end display
}; // end video




$(document).ready(function () {
    //loads filenames from manifest.json in local folder
    $.getJSON(Rashomon.manifestLoc, function (data) {
        Rashomon.manifest = data;
        Rashomon.mpath = Rashomon.manifest.mediaPath;
        Rashomon.eventName = Rashomon.manifest.event;
        if (Rashomon.manifest.videos) {
            Rashomon.vidmeta = Rashomon.manifest.videos;
        }
        if (Rashomon.manifest.photos) {
            Rashomon.phometa = Rashomon.manifest.photos;
        }

        Rashomon.earliest = moment(Rashomon.manifest.earliest).toDate();
        Rashomon.setupVideos();
        Rashomon.setupPhotos();
        Rashomon.setupTimeline(Rashomon.fulldur);
        $(Rashomon.videos).each(function () {
            this.displayVideo();
        });
        $(Rashomon.photos).each(function(){
            this.displayPhoto(); 
        });
        
    });
    $("#xbox").click(function () {
        $("#fsvid").remove();
        $("#fullscreen").fadeOut();
        $("body").css("overflow", "visible");
        return false;
    });
    $(".mediaSection h1").click(function () {
        $("#timepos").css("height", "100%");
        $(this).next(".lines").slideToggle(function () {

            var first = $(".lines:visible").first();
            var newheight = $("#maintimeline").offset().top + $("#maintimeline").height() - first.offset().top;
            $("#timepos").css("height", newheight);

        });
    });


}); //end docReady
