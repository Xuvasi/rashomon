/*
rashomon
copyleft 2012
*/
var Rashomon = {
  videos: [],
  photos: [],
  loaded: 0,
  delayFixed: 0,
  fulldur: 0,
  earliest: new Date(),
  timeline: "",
  videosToDisplay: "",
  colorList: ["Sienna", "BlueViolet", "DarkGreen", "Indigo", "Darkred", "AliceBlue", "DarkBlue", "DarkGoldenRod", "DarkGreen", "Crimson", "ForestGreen", "DarkSeaGreen", "DarkSalmon", "Darkorange", "IndianRed", "Indigo"],
  mpath: rashomonManifest.mediaPath,
  filenames: rashomonManifest.files,
  validDate: function (item) {
    //makes sure date isn't from 1904 or 1946 or sometime way before videos existed
    if (item.mcDate > 2000) {
      return item.mcDate;
    } else {
      return item.fmDate;
    }
  },
  formatDate: function (exifDate) {
    if (!exifDate) {
      return false;
    }
    //input format looks like "YYYY:MM:DD HH:MM:SS:mm-05:00" (-05:00 is timezone)
    var date = exifDate.toString();
    var str = date.split(" "); //sep date from time
    var datesplit = str[0].split(":");
    var year = datesplit[0];
    var month = datesplit[1] - 1;
    var day = datesplit[2];
    var timesplit = str[1].split(":");
    var hour = timesplit[0];
    var minute = timesplit[1];
    var second = timesplit[2];
    if (timesplit[2].indexOf("-") !== -1) {
      //HUGE BUG this does not correct if you're in a time zone with a "+" of gmt. FIX LATER THANKS
      var zone = timesplit[2].split("-");
      second = zone[0];
      zone = zone[1].split(":");
      zone = zone[0];
      hour -= zone;
      hour = hour < 10 ? "0" + hour : hour;
    } //end if
    var d = new Date(year, month, day, hour, minute, second, 0);
    //console.log(d);
    //console.log("At the tone, the time will be: " + year + " " + month + " " + day + " " + hour + " " + minute + " " + second);
    return d;
  },
  //converts seconds to hh:mm:ss
  sec2hms: function (time) {
    var totalSec = parseInt(time, 10);
    var hours = parseInt(totalSec / 3600, 10) % 24;
    var minutes = parseInt(totalSec / 60, 10) % 60;
    var seconds = parseInt(totalSec % 60, 10);
    return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
  },
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
  //sets up the timeline element and loads each video, determines timescope based on its contents
  setupTimeline: function (duration) {
    $(Rashomon.photos).each(function () {
      this.buildPhotoViewer();
    });
    $(Rashomon.videos).each(function () {
      var id = this.id;
      var vid = this;
      this.buildVideoPlayer();
      //console.log("Binding " + id);
      $('#video' + id).on('loadeddata', function () {
        //console.log("Data loaded on " + id);
        Rashomon.loaded++;
        var of = vid.offset;
        var duration = vid.pp.duration();
        $(this).attr('data-duration', vid.pp.duration());
        var height = +vid.pp.media.videoHeight;
        var width = +vid.pp.media.videoWidth;
        //console.log(pid + ": " + height + " x " + width);
        if (height > width) {
          $(this).addClass("vert");
        } else {
          $(this).addClass("hor");
        }
        var offtime = Popcorn.util.toSeconds(duration) + parseInt(of, 10);
        Rashomon.timeline.cue(offtime, function () {
          vid.hideVid();
        });
        Rashomon.timeline.cue(of, function () {
          if (!(Rashomon.timeline.media.paused)) {
            vid.pp.play();
            vid.showVid();
          }
        }); //end cue
        //if all videos have loaded
        if (Rashomon.loaded === Rashomon.videos.length) {
          var newheight = $("#maintimeline").offset().top + $("#maintimeline").height() - $("#timepos").offset().top;
          $("#timepos").css("height", newheight);
          $("#timepos").show();
          Rashomon.timeline.play();
        }
      }); //end bind
    }); //end each
    Popcorn.player("baseplayer");
    this.timeline = Popcorn.baseplayer("#maintimeline");
    this.timeline.currentTime(0);
    this.fulldur = duration; // 6 minutes
    this.timeline.on("play", function () {
      $("#play").hide();
      $("#stop").show();
      $(Rashomon.videos).each(function () {
        var offset = this.offset;
        var duration = this.pp.duration();
        if (Rashomon.timeline.currentTime() > offset && Rashomon.timeline.currentTime() < offset + duration && !$("#vcontain" + this.id).is(":hidden")) {
          this.pp.play();
        }
      }); // end videos each
    }); //end play
    this.timeline.on("pause", function () {
      $("#play").show();
      $("#stop").hide();
      $(Rashomon.videos).each(function () {
        this.pp.pause(Rashomon.timeline.currentTime() - this.offset);
      });
    }); //end pause
    $("#maintimeline").attr("data-duration", Rashomon.fulldur);
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
    //adjust playhead when main timeline moves
    Rashomon.timeline.on("timeupdate", function () {
      if (this.currentTime() > Rashomon.fulldur - 0.5) {
        this.pause(Rashomon.fulldur - 0.5);
      }
      var pct = this.currentTime() / Rashomon.fulldur * 100; // for when we switch to % for window size adjustments
      $("#timeloc").text(Rashomon.sec2hms(this.currentTime()));
      $("#timepos").css('left', pct + "%");
    });
    //on navtl click, adjust video positions appropriately, obeying play conditions and such
  },
  getOffset: function (time) {
    return $("#maintimeline").width() * time / Popcorn.util.toSeconds($('#maintimeline').attr('data-duration'));
  },
  /* reads videos from rashomonManifest object, which is created by another hunk of js linked in the html */
  setupVideos: function () {
    var l = Rashomon.filenames.length;
    $.each(Rashomon.filenames, function (index) {
      var item = {};
      item.filename = '' + this;
      $.getJSON("metadata/" + this + ".json", function (itemdata) {
        item.origDate = Rashomon.formatDate(itemdata[0].DateTimeOriginal);
        item.tcDate = Rashomon.formatDate(itemdata[0].TrackCreateDate);
        item.tmDate = Rashomon.formatDate(itemdata[0].TrackModifyDate);
        item.fmDate = Rashomon.formatDate(itemdata[0].FileModifyDate);
        item.mcDate = Rashomon.formatDate(itemdata[0].MediaCreateDate);
        item.mDate = Rashomon.formatDate(itemdata[0].MediaModifyDate);
        item.duration = Rashomon.formatDuration(itemdata[0].Duration);
        //get other tags like geo coords here
        item.vDate = Rashomon.validDate(item);
        if (item.vDate.getTime() < Rashomon.earliest.getTime()) {
          Rashomon.earliest = item.vDate;
          console.log("Earliest now " + Rashomon.earliest);
        }
        if (item.duration) {
          var vid = Rashomon.videos.push(new video({
            "offset": item.vDate.getTime() / 1000,
            "duration": +item.duration,
            "id": index,
            "file": item.filename,
            "meta": itemdata[0]
          }));
        } else {
          var aphoto = Rashomon.photos.push(new photo({
            "offset": item.vDate.getTime() / 1000,
            "id": Rashomon.videos.length + 1,
            "file": item.filename,
            "meta": itemdata[0]
          }));
        }
        l--;
        if (Rashomon.videos.length + Rashomon.photos.length === Rashomon.filenames.length) {
          $.each(Rashomon.videos, function () {
            var id = this.id;
            this.offset -= Rashomon.earliest.getTime() / 1000 - 1;
            $('#video' + id).attr('data-offset', this.offset);
            if (this.duration + this.offset > Rashomon.fulldur) {
              Rashomon.fulldur = this.duration + this.offset + 15;
            }
          });
          displayEvent(1, Rashomon.earliest, "orange", 1);
          $('#maintimeline').attr('data-duration', Rashomon.fulldur);
          Rashomon.setupTimeline(Rashomon.fulldur);
          $.each(Rashomon.videos, function () {
            this.displayVideo();
          }); //end each
        } // end if
      }); //end getJSON (per item)
    }); //end each
  }
};
var photo = function (options) {
  this.offset = options.offset;
  this.name = options.file;
  this.file = options.file;
  this.id = Rashomon.filenames.indexOf(options.file);
  this.color = Rashomon.colorList[this.id];
  this.meta = options.meta;
  this.buildPhotoViewer = function () {
    var pContainer = $("<div/>", {
      id: "pContainer" + this.id,
      'class': 'container'
    });
    var tools = $("<div/>", {
      'class': 'tools'
    });
    tools.html("<em>" + (this.id + 1) + "</em> <div class='tbuttons'><img src='images/full-screen-icon.png' class='fsbutton' id='fs" + this.id + "'/> <img src='images/info.png' class='showmeta' id='meta" + this.id + "'>").appendTo(pContainer);
    var photo = $("<img/>", {
      id: "photo" + this.id,
      "class": 'rashomon',
      "data-offset": this.offset,
      "data-id": this.id,
      "src": Rashomon.mpath + this.file + ".jpg"
    });
    pContainer.appendTo("#videos");
    photo.appendTo(pContainer);
  };
}; // end photo
var video = function (options) {
  this.offset = options.offset;
  this.duration = options.duration;
  this.name = options.file;
  this.file = options.file;
  this.id = (options.id);
  this.color = Rashomon.colorList[this.id];
  this.meta = options.meta;
  this.buildVideoPlayer = function () {
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
      src: Rashomon.mpath + this.file + ".webm",
      type: 'video/webm'
    });
    this.mp4 = $("<source/>", {
      src: Rashomon.mpath + this.file + ".mp4",
      type: 'video/mp4'
    });
    this.mp4.appendTo(vid);
    this.webm.appendTo(vid);
    container.appendTo($("#videos"));
    vid.appendTo(container);
    tools.html("<em>" + (this.id + 1) + "</em> <div class='tbuttons'><img src='images/full-screen-icon.png' class='fsbutton' id='fs" + this.id + "'/> <img src='images/info.png' class='showmeta' id='meta" + this.id + "'>").appendTo(container);
    $("<div/>", {
      "id": "vidDelay" + this.id,
      "class": "vidDelay"
    }).appendTo(tools);
    this.pp = Popcorn("#video" + this.id);
    this.pp.mute();
  };
  this.showVid = function () {
    $("#vcontain" + this.id).show("fast", "linear");
    $("#vid" + this.id).addClass("vidactive");
  };
  this.hideVid = function () {
    this.pp.pause();
    if ($("#vcontain" + this.id).is(":visible")) {
      $("#vcontain" + this.id).hide("fast", "linear");
      $("#vid" + this.id).removeClass("vidactive");
    }
  };
  this.showMeta = function () {
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
  };
  this.drawVidtimes = function () {
    var newwidth = Rashomon.getOffset(this.duration) / $("#maintimeline").width() * 100 + "%";
    $("#vidtime" + this.id).css({
      "width": newwidth,
      "left": Rashomon.getOffset(this.offset)
    });
  };
  this.displayVideo = function () {
    var vid = this;
    var id = this.id;
    var duration = this.duration;
    var meta = this.meta;
    var offset = this.offset;
    var position = Rashomon.getOffset(offset);
    //console.log("Offset" + this.offset + "data " + $("#video" + id).attr("data-offset"));
    //console.log(offset);
    //todo duration->space, match meta to real meta
    var leftpos = position;
    var vidline = $("<div/>", {
      "class": "vidline " + Rashomon.isEven(id),
      "id": "vidline" + id
    });
    var vidnum = $("<div/>", {
      "class": "vidnum",
      "id": "vid" + id,
      "text": +id + 1,
      title: "Click to show video"
    }).appendTo(vidline);
    var vidmeta = $("<div/>", {
      "class": "vidmeta"
    }).appendTo(vidline);
    $("<p/>", {
      text: meta
    }).appendTo(vidmeta);
    $("<p/>", {
      text: "start: " + Rashomon.sec2hms(offset)
    }).appendTo(vidmeta);
    $("<p/>", {
      text: "duration: " + Rashomon.sec2hms(duration)
    }).appendTo(vidmeta);
    var vidtl = $("<div/>", {
      "class": "vidtl",
      "id": "tl" + id,
      "data-id": id
    }).appendTo(vidline);
    var vidtime = $("<div/>", {
      "class": "vidtime",
      "id": "vidtime" + id,
      "data-id": id,
      "title": this.file
    }).css({
      "left": leftpos / $("#maintimeline").width() * 100 + "%",
      "width": "1px",
      "background": Rashomon.colorList[id]
    }).appendTo(vidtl);
    //console.log("Offset for duration " + duration + " is " + Rashomon.getOffset(duration));
    vidline.appendTo("#vidlines");
    $('.vidline').tsort({
      attr: 'id'
    });
    this.drawVidtimes();
    /*  block to show relative time, calculation is wrong to show time
      $('.vidtl').mousemove(function(e){
          var mouseleft = e.pageX - $('#maintimeline').offset().left;
          var pct = mouseleft / $('#maintimeline').width();
          var tldur = Popcorn.util.toSeconds($('#maintimeline').attr('data-duration'));
          $('#mouseloc').html(Rashomon.sec2hms(tldur * pct));
      });
      */
    //experimental seeking optimization code
    $("#video" + id).on("seeking", function () {
      if (!Rashomon.timeline.media.paused && Popcorn("#video" + id).media.paused) {
        Rashomon.timeline.resume = true;
        Rashomon.timeline.pause();
      }
    });
    $("#video" + id).on("seeked", function () {
      if (Rashomon.timeline.resume) {
        Rashomon.timeline.play();
        Rashomon.timeline.resume = false;
      }
    });
    $("#video" + id).mouseover(function () {
      Popcorn("#video" + id).unmute();
    });
    $("#video" + id).mouseleave(function () {
      Popcorn("#video" + id).mute();
    });
    //trigger fullscreen
    $("#fs" + id).click(function () {
      loadFullscreen(id);
      return false;
    });
    //toggle metadata
    $("#meta" + id).click(function () {
      vid.showMeta();
      return false;
    });
    $("#tl" + id).click(function (e) {
      var clickleft = e.pageX - $('#maintimeline').offset().left;
      var pct = clickleft / $('#maintimeline').width();
      var tldur = Popcorn.util.toSeconds($('#maintimeline').attr('data-duration'));
      Rashomon.timeline.currentTime(tldur * pct);
      $(Rashomon.videos).each(function () {
        var timediff = Rashomon.timeline.currentTime() - this.offset;
        if (timediff < 0) {
          this.pp.pause(0);
          this.hideVid();
        } else if (Rashomon.timeline.currentTime() > this.offset + this.duration) {
          this.pp.pause(this.pp.duration());
          console.log("setting " + this.id + " to " + this.duration);
          this.hideVid();
        } else if (Rashomon.timeline.currentTime() > this.offset && Rashomon.timeline.currentTime() < this.offset + this.duration) {
          this.pp.currentTime(timediff);
          this.showVid();
          if (!Rashomon.timeline.media.paused) {
            console.log("it's not paused" + this.id);
            console.log(Rashomon.timeline.currentTime() + "is > " + this.offset + " and < " + this.offset + this.duration);
            this.pp.play();
          }
          //console.log("setting " + this.id + " to " + timediff);
        } else {
          console.log("id " + this.id + " tdiff " + timediff);
        }
      }); // end rashomon each
    }); //end nav click
    $("#vid" + id).click(function () {
      console.log("toggling " + id);
      $("#vid" + id).toggleClass("vidactive");
      var pp = Popcorn("#video" + id);
      $("#vidnum" + id).toggleClass("vidactive");
      var thisvid = $("#vcontain" + id);
      thisvid.fadeToggle("fast", "linear");
      if (thisvid.is(":hidden")) {
        pp.pause();
      } else {
        console.log("test case");
        //deal with case where if video doesn't play if toggled on during period when it should
      }
    }); // end vidnum click
    this.pp.on('timeupdate', function () {
      var delay = (Rashomon.timeline.currentTime() - (vid.offset + this.currentTime())).toFixed(2) * 1000;
      if (!Rashomon.timeline.media.paused && Math.abs(delay) > 1250) {
        this.currentTime(Rashomon.timeline.currentTime() - vid.offset);
        Rashomon.delayFixed++;
      }
      var syncmsg = "<p>" + id + " " + vid.file + "</p>" + "<p>CurrentTime: " + Rashomon.timeline.currentTime().toFixed(2) + "</p>" + "<p>Video Location: " + (vid.offset + this.currentTime()).toFixed(2) + "</p>" + "<p>Offset: " + vid.offset + "</p>" + "<p>Video Drift: " + delay + "ms</p>";
      var syncmsg = "<p>Video Drift: " + delay + "ms</p>";
      $("#vidDelay" + id).html(syncmsg);
    }); //end on
  };
  return this.id;
}; // end video
$(document).ready(function () {
  //loads filenames from manifest.json in local folder
  Rashomon.setupVideos(); // could point to one from a different event or something
  $("#metaX").click(function () {
    $("#meta").css("right", "-210px");
  });
}); //end docReady
//last freehanging event because it needs a rewrite
function displayEvent(id, title, color, time) {
  //todo need to figure out how to distribute colors, convert time to space
  $("<div/>", {
    "class": 'event',
    "id": "event_" + id,
    "title": title
  }).css({
    'left': time / $("#maintimeline").width() * 100 + "%",
    'background': color
  }).appendTo("#maintimeline");
}