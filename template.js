/* A video object - holds all of the information to display this video's footprint on the timeline.
@param offset is the offset relative to the beginning of the time frame
@param duration is the duration of the video
@param is this video's identification number - to be able to link to the actual video
@param name is the name of this video
*/
var videos = [];
var loaded = 0;
var mpath = "http://metaviddemo01.ucsc.edu/rashomon/media/";
  
var fulldur = 0;
var earliest = new Date();
var timeline;
var videosToDisplay;
var filenames = [];
var colorList = [ "Sienna", "BlueViolet", "DarkGreen", "Indigo", "Darkred", "AliceBlue", "DarkBlue", "DarkGoldenRod", "DarkGreen", "Crimson", "ForestGreen", "DarkSeaGreen", "DarkSalmon", "Darkorange", "IndianRed", "Indigo"];

function video(offset, duration, id, file, align, meta) {
  this.offset = offset.getTime() / 1000;
  this.duration = +duration;
  this.name = file;
  this.file = file;
  this.id = filenames.indexOf(file);
  this.color = colorList[id];
  this.align = align;
  this.meta = meta;
  var container = $("<div/>", {
    id: "vcontain" + this.id,
    'class': 'vidcontainer'
  }).css("border-color", colorList[this.id]);
  var tools = $("<div/>", {
    'class': 'vidtools'
  }); 
  var vid = $("<video/>", {
    id: "video" + this.id,
    "class": 'rashomon ' + this.align,
    "data-offset": this.offset,
    "data-id": this.id
  });
  this.webm = $("<source/>", {
    src: mpath + file + ".webm",
    type: 'video/webm'
  });  this.mp4 = $("<source/>", {
    src: mpath + file + ".mp4",
    type: 'video/mp4'
  });
  this.webm.appendTo(vid);
  this.mp4.appendTo(vid);
  container.appendTo($("#videos"));
  vid.appendTo(container);
  
  tools.html("<em>" + (this.id + 1 ) + "</em> <div class='tbuttons'><a class='fullscreen' id='" + this.id + "'> <img src='images/full-screen-icon.png'id='" + this.id + "'/> </a> <em class='showmeta' id='" + this.id + "'>i</em>").appendTo(container);
  this.pp = Popcorn("#video" + this.id);

}





$(document).ready(function () {


  /* Temporary list of video locations that match up in order with the JSON files in FILENAMES */
  var videos = [];
  var collection = {};

  //loads filenames from manifest.json in local folder
  setupVideos('manifest.json'); // could point to one from a different event or something



  /* focusDistance is a flag that says if a point has been specified to place a region of interest*/
  var focusDistance = false;
  /* dotCoords holds the first point specified by the user on the page*/
  var dotCoords = [];
  /* focusRegion holds the current region of interest specified by the user.  This will be used to play videos from a specific point in time.*/
  var focusRegion = [];



  /* This handles the focus region when the user clicks the MAINTIMELINE*/
  $("#maintimeline").click(function (mouse) {
    var offset = $("#maintimeline").offset();
    var fixedX = mouse.pageX - offset.left;
    if (!focusDistance) {
      focusDistance = true;
      placeDot("#maintimeline", fixedX, mouse.pageY);
      dotCoords = [];
      dotCoords.push(fixedX, mouse.pageY);
    } else {
      placeBeam("#maintimeline", fixedX, mouse.pageY, dotCoords);
      focusDistance = false;
      focusRegion = [];
      focusRegion.push(Math.min(fixedX, dotCoords[0]), Math.max(mouse.pageX, dotCoords[0]));
    }
  });



/*
  displayEvent(1, "something happened right then", "orange", 15);
  displayEvent(2, "something else happened here", "aqua", 40);
  displayEvent(3, "another something", "BlueViolet", 212);
  displayEvent(4, "yet another", "Khaki", 512);
  displayEvent(5, "wwwhwat?", "Green", 432);
  displayEvent(6, "crazy", "Olive", 79);
*/


}); //end docReady






/*Place box around region of interest specified by the user
@param where is the place on the page to put this box
@param coords is [xcoord, ycoord] of one bound
@param  x, y is the [xcoord, ycoord] of the other bound
Note : the order of these bounds does not matter
*/
function placeBeam(where, x, y, coords) {
  $(".dot").css("visibility", "hidden");
  $("<div/>", {
    "class": 'beam'
  }).css({
    'width': Math.abs(coords[0] - x) + "px",
    'left': Math.min(coords[0], x),
    'background': "yellow"
  }).appendTo(where);
}

/*Place a dot to show the user they specified one of the bounds of a region they are interested in
@param where is the place on the page to put this dot
@param x, y is the [xcoord, ycoord] of this dot
*/
function placeDot(where, x, y) {
  $(".beam").css("visibility", "hidden");
  $("<div/>", {
    "class": 'dot'
  }).css({
    'left': x,
    'background': "yellow"
  }).appendTo(where);
}

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





function displayVideo(id, start, duration, meta) {
  //todo duration->space, match meta to real meta
  var offset = $("#maintimeline").offset().left;
  var leftpos = start;
  var vidline = $("<div/>", {
    "class": "vidline " + isEven(id),
    "id": "vidline" + id
  });
  var vidnum = $("<div/>", {
    "class": "vidnum",
    "id": "vid" + id,
    text: + id + 1,
    title: "Click to show video"
  }).appendTo(vidline);
  var vidmeta = $("<div/>", {
    "class": "vidmeta"
  }).appendTo(vidline);
  $("<p/>", {
    text: meta
  }).appendTo(vidmeta);
  $("<p/>", {
    text: "start: " + sec2hms(start)
  }).appendTo(vidmeta);
  $("<p/>", {
    text: "duration: " + sec2hms(duration)
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
    "title": meta
  }).css({
    "left": leftpos / $("#maintimeline").width() * 100 + "%",
    "width": "1px",
    "background": colorList[id]
  }).appendTo(vidtl);
  //console.log("Offset for duration " + duration + " is " + getOffset(duration));
  vidline.appendTo("#vidlines");
  $('.vidline').tsort({
    attr: 'id'
  });
  drawVidtimes();

  /*  block to show relative time, calculation is wrong to show time 
    $('.vidtl').mousemove(function(e){
        var mouseleft = e.pageX - $('#maintimeline').offset().left;
        var pct = mouseleft / $('#maintimeline').width();
        var tldur = Popcorn.util.toSeconds($('#maintimeline').attr('data-duration'));
        $('#mouseloc').html(sec2hms(tldur * pct));
    });
    */

  /* experimental seeking optimization code
    $("video").on("seeking", function() {
	timeline.pause();
    });
    $("video").on("seeked", function() {
	timeline.play();
    });
    */

  $(".vidtl").unbind('click').click(function (e) {
    var clickleft = e.pageX - $('#maintimeline').offset().left;
    var pct = clickleft / $('#maintimeline').width();
    var tldur = Popcorn.util.toSeconds($('#maintimeline').attr('data-duration'));
    timeline.currentTime(tldur * pct);
    $(videos).each(function () {
      var timediff = timeline.currentTime() - this.offset;
      if (timediff < 0) {
        this.pp.pause();
        this.pp.currentTime(0);
        //console.log("setting " + this.id + " to 0");
        hideVid(this.id);
      } else if (timeline.currentTime() > this.offset + this.duration) {
        this.pp.pause();
        this.pp.currentTime(this.pp.duration());
        console.log("setting " + this.id + " to " + this.duration);
        hideVid(this.id);

      } else if (timeline.currentTime() > this.offset && timeline.currentTime() < this.offset + this.duration) {
        this.pp.currentTime(timediff);
        showVid(this.id);

        if (!timeline.media.paused) {
          console.log("it's not paused" + this.id);
          console.log(timeline.currentTime() + "is > " + this.offset + " and < " + this.offset + this.duration);
          this.pp.play();
        }
        //console.log("setting " + this.id + " to " + timediff);
      } else {
        console.log("id " + this.id + " tdiff " + timediff);
      }

    }); // end rashomon each
  }); //end nav click 
  $("#vid" + id).click(function () {
    var vid_id = id;

    toggleVid(id);
  }); // end vidnum click
  


}


//converts secs to hh:mm:ss with leading zeros
function sec2hms(time) {
  var totalSec = parseInt(time, 10);
  var hours = parseInt(totalSec / 3600, 10) % 24;
  var minutes = parseInt(totalSec / 60, 10) % 60;
  var seconds = parseInt(totalSec % 60, 10);
  return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

function showVid(id) {
  var pp = Popcorn("#video" + id);
  $("#vcontain" + id).show("fast", "linear");
  $("#vid" + id).addClass("vidactive");
}

function hideVid(id) {

  var pp = Popcorn("#video" + id);
  pp.pause();
  if ($("#vcontain" + id).is(":visible")) {
    $("#vcontain" + id).hide("fast", "linear");
    $("#vid" + id).removeClass("vidactive");
  }
}

function toggleVid(id) {
  console.log("toggling " + id);
  $("#vid" + id).toggleClass("vidactive");
  var pp = Popcorn("#video" + id);
  var of = $("#video" + id).attr("data-offset");
  $("#vidnum" + id).toggleClass("vidactive");
  var thisvid = $("#vcontain" + id);
  thisvid.fadeToggle("fast", "linear");
  if (thisvid.is(":hidden")) {
    pp.pause();
  } else {
    console.log("test case");
    //deal with case where if video doesn't play if toggled on during period when it should
  }

}

//sets up timelines once total duration has been set
function setupTl(duration) {
  console.log("setting up tl");
  Popcorn.player("baseplayer");
  timeline = Popcorn.baseplayer("#base");
  timeline.currentTime(70);
  timeline.endtime = duration; // 6 minutes
  timeline.on("play", function () {
    $("#play").hide();
    $("#stop").show();
  });
  timeline.on("pause", function () {
    $("#play").show();
    $("#stop").hide();
    $(videos).each(function () {
      this.pp.pause();
    });

  });

  $("#maintimeline").attr("data-duration", timeline.endtime);
  timeline.cue(timeline.endtime - 0.01, function () {
    timeline.pause();
    console.log("pausing");
  });
  //as each video loads up, set up cues
  //todo - move video timeline drawing to this section
  $('video').bind('loadedmetadata', function () {
    loaded++;
    var pid = $(this).attr('id');
    var pop = Popcorn('#' + pid);
    var id = $(this).attr('data-id');
    var of = $(this).attr('data-offset');
    var duration = pop.duration();
    
    $(this).attr('data-duration', pop.duration());
    var height = pop.media.videoHeight;
    var width = pop.media.videoWidth;
    console.log(height + " x " + width);
    if (height > width) {
        $(this).addClass("vert");
    } else { 
        $(this).addClass("hor");
    }
      
    var totalwidth = $("#maintimeline").width();
    var offset = getOffset($(this).attr('data-offset'));
    displayVideo(id, offset, duration, videos[id].file);
    console.log("metadata loaded on " + pid)
    var offtime = Popcorn.util.toSeconds(duration) + parseInt(of);
    console.log(offtime);

    timeline.cue(offtime, function () {
      hideVid(id);
    });
    timeline.cue(of, function () {
      if (!(timeline.media.paused)) {
        pop.play();
        showVid(id);
      }
    }); //end cue
  console.log(loaded);
  //if all videos have loaded
  if (loaded == videos.length) {
    var newheight = $("#maintimeline").offset().top + $("#maintimeline").height() - $("#timepos").offset().top;
  
    $("#timepos").css("height", newheight);
    $("#timepos").show();
    timeline.play();
    
  }
  }); //end bind

  //play button behavior
  $("#play").click(function () {
    //console.log(timeline.currentTime() + "of " + timeline.endtime);
    if (timeline.currentTime() < timeline.endtime) {

      timeline.play();
    }
    $(videos).each(function () {

      var offset = this.offset;
      var duration = this.pp.duration();
      if (timeline.currentTime() > offset && timeline.currentTime() < offset + duration && !$("#vcontain" + this.id).is(":hidden")) {
        this.pp.play();
      }
    });
  });
  //pause media when stop button is pressed
  $("#stop").click(function () {
    timeline.pause();
  });
  //adjust playhead when main timeline moves
  timeline.on("timeupdate", function () {
    if (this.currentTime() > this.endtime - 0.5) {
      this.pause(this.endtime - 0.5);
    }
    var fulldur = timeline.endtime;
    var totalwidth = $("#maintimeline").width();
    var pct = this.currentTime() / fulldur * 100; // for when we switch to % for window size adjustments
    var newoffset = totalwidth * this.currentTime() / fulldur;
    $("#timeloc").text(sec2hms(this.currentTime()));
    $("#timepos").css('left', pct + "%");

  });
  //on navtl click, adjust video positions appropriately, obeying play conditions and such
}

function drawVidtimes() {

  $.each(videos, function (i, vid) {
    var newwidth = getOffset(vid.duration) / $("#maintimeline").width() * 100 + "%";
    $("#vidtime" + vid.id).css("width", newwidth);

  });

}





function validDate(item) {
  //makes sure date isn't from 1904 or 1946 or sometime way before videos existed
  if (item.mcDate > 2000) {
    return item.mcDate;
  } else {
    return item.fmDate;
  }
}

function formatDate(exifDate) {
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

  }

  var d = new Date(year, month, day, hour, minute, second, 0);
  //console.log(d);
  //console.log("At the tone, the time will be: " + year + " " + month + " " + day + " " + hour + " " + minute + " " + second);
  return d;

}

function getOffset(time) {
  return $("#maintimeline").width() * time / Popcorn.util.toSeconds($('#maintimeline').attr('data-duration'));
}


function formatDuration(duration) {
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

}

function setupVideos(json) {

  $.getJSON(json, function (collecdata) {

    filenames = collecdata.files;
    var l = filenames.length;
    $.each(filenames, function () {
      var item = {};

      item.filename = '' + this;
      $.getJSON("metadata/" + this + ".json", function (itemdata) {
        item.tcDate = formatDate(itemdata[0].TrackCreateDate);
        item.tmDate = formatDate(itemdata[0].TrackModifyDate);
        item.fmDate = formatDate(itemdata[0].FileModifyDate);
        item.mcDate = formatDate(itemdata[0].MediaCreateDate);
        item.mDate = formatDate(itemdata[0].MediaModifyDate);
        item.duration = formatDuration(itemdata[0].Duration);
  
        //get other tags like geo coords here
        item.validDate = validDate(item);
        if (item.validDate.getTime() < earliest.getTime()) {

          earliest = item.validDate;
        }
        videos.push(new video(item.validDate, item.duration, videos.length + 1, item.filename, item.align, itemdata[0]));

        l--;
        if (l === 0) {
          //trigger fullscreen
          $(".fullscreen").click(function (event) {
              var target = $(event.target).attr('id');
              loadFullscreen(target);
              return false;
            });
          //toggle metadata
          $(".showmeta").click(function (event) {
              var target = $(event.target).attr('id');
              showMeta(target);
              return false;
            });
          
            
            
          $.each(videos, function () {
            var id = this.id
            this.offset -= earliest.getTime() / 1000 - 3;
            $('#video' + this.id).attr('data-offset', this.offset);
          

            if (this.duration + this.offset > fulldur) {
              fulldur = this.duration + this.offset + 15;
            }
          });


          $('#maintimeline').attr('data-duration', fulldur);
          setupTl(fulldur);

        }

      }); //end getJSON (per item)
    }); //end each
  }); //end manifest getJSON
}

function showMeta(id) {

  $("#meta").css("right", "0");
  var meta = videos[id].meta;
  
  if(meta.GPSPosition) {
    var latLng = new google.maps.LatLng(convertCoord(meta.GPSLatitude), convertCoord(meta.GPSLongitude));
    var map = new google.maps.Map(document.getElementById("map_canvas"),
            { center: latLng, zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP });
    var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      title: id + 1
  });
  }
  
}

function convertCoord(coord){
  var split = coord.split(" ");
  if (split[1] == "S" || split[1] == "W"){
    return split[0] * -1;      
  } else { 
    return split[0];
  }
}

var isEven = function (someNumber) {
    return (someNumber % 2 === 0) ? "even" : "odd";
  }