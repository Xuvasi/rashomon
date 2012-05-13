var timeline, videosToDisplay, videos = [], fulldur = 0, earliest = new Date;

function video(offset, duration, id, file) {
    var mpath, container, tools, vid, webm, mp4;
    this.offset = offset.getTime() / 1e3;
    this.duration = +duration;
    this.id = id;
    this.name = file;
    this.file = file;
    this.align = "hor";
    mpath = "http://metaviddemo01.ucsc.edu/rashomon/media/";
    container = $("<div/>", {
        id: "vcontain" + this.id,
        "class": "vidcontainer"
    });
    tools = $("<h4/>", {
        "class": "vidtools",
        text: "(I) (F) (TBI)"
    });
    vid = $("<video/>", {
        id: "video" + this.id,
        "class": "rashomon",
        "data-offset": this.offset,
        "data-id": this.id
    });
    vid.addClass(this.align);
    webm = $("<source/>", {
        src: mpath + file + ".webm",
        type: "video/webm"
    }).appendTo(vid);
    mp4 = $("<source/>", {
        src: mpath + file + ".mp4",
        type: "video/mp4"
    }).appendTo(vid);
    container.appendTo($("#videos"));
    vid.appendTo(container);
    tools.appendTo(container);
    this.pp = Popcorn("#video" + this.id);
}

$(document).ready(function() {
    var pageNumber, fileNames, activeFiles, numVideosToDisplay, colorList, focusDistance, dotCoords, focusRegion, upPagerActive, downPagerActive, maxPageNumber, numVideos, testActive, videosToDisplay, temp, videos = [], collection = {};
    setupVideos("manifest.json");
    console.log(videos.length);
    pageNumber = 1;
    fileNames = [];
    activeFiles = [];
    numVideosToDisplay = 5;
    colorList = [ "AliceBlue", "Aqua", "DarkBlue", "DarkGoldenRod", "DarkGreen", "Crimson", "ForestGreen", "DarkSeaGreen", "DarkSalmon", "Darkorange", "IndianRed", "Indigo" ];
    focusDistance = false;
    dotCoords = [];
    focusRegion = [];
    $("#maintimeline").click(function(mouse) {
        var offset = $("#maintimeline").offset(), fixedX = mouse.pageX - offset.left;
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
    upPagerActive = true;
    downPagerActive = true;
    maxPageNumber = 2;
    numVideos = videos.length;
    displayEvent(1, "something happened right then", "orange", 15);
    displayEvent(2, "something else happened here", "aqua", 40);
    displayEvent(3, "another something", "BlueViolet", 212);
    displayEvent(4, "yet another", "Khaki", 512);
    displayEvent(5, "wwwhwat?", "Green", 432);
    displayEvent(6, "crazy", "Olive", 79);
    testActive = [];
    transferElements(videos, testActive, (pageNumber - 1) * numVideosToDisplay, pageNumber * numVideosToDisplay - 1);
    $.each(testActive, function(key, val) {
        displayVideo(val.id, val.offset, val.duration, val.name);
    });
    if (numVideos <= numVideosToDisplay) {
        $(".pager").toggleClass("pagerDisappear");
        upPagerActive = false;
        downPagerActive = false;
    }
    if (pageNumber === 1) {
        upPagerActive = false;
        pagerDisappear(".pager.#up");
    }
    $(".pager").click(function() {
        var pageNumberPrevious = pageNumber;
        if ($(this).attr("id") === "up" && upPagerActive) {
            pageNumber -= 1;
        } else if (downPagerActive && $(this).attr("id") === "down") {
            pageNumber += 1;
        }
        if (pageNumber === maxPageNumber) {
            pagerDisappear(".pager.#down");
            pagerAppear(".pager.#up");
            downPagerActive = false;
        } else {
            downPagerActive = true;
            pagerAppear(".pager.#down");
        }
        if (pageNumber === 1) {
            pagerDisappear(".pager.#up");
            upPagerActive = false;
        } else {
            pagerAppear(".pager.#up");
            upPagerActive = true;
        }
        if (pageNumberPrevious !== pageNumber) {
            $.each(testActive, function(key, val) {
                $("div#vid" + val.id + ".vidline").hide();
            });
            testActive = [];
            transferElements(videos, testActive, (pageNumber - 1) * numVideosToDisplay, pageNumber * numVideosToDisplay - 1);
            $.each(testActive, function(key, val) {
                if (!$("div#vid" + val.id + ".vidline").is(":hidden")) {
                    displayVideo(val.id, val.offset, val.duration, val.name);
                    $(".vidnum" + "#vid" + val.id).click(function() {
                        var num = $(this).html();
                        if ($.inArray(num, videosToDisplay) !== -1) {
                            temp = [];
                            $.each(videosToDisplay, function(k, v) {
                                if (v !== num) {
                                    temp.push(v);
                                }
                            });
                            videosToDisplay = [];
                            $.each(temp, function(key, val) {
                                videosToDisplay.push(val);
                            });
                        } else {
                            videosToDisplay.push(num);
                        }
                        $(this).toggleClass("vidactive");
                        toggleVid($(this).text());
                    });
                } else {
                    $("div#vid" + val.id + ".vidline").show();
                }
            });
        }
    });
    videosToDisplay = [];
    temp = [];
});

function placeBeam(where, x, y, coords) {
    $(".dot").css("visibility", "hidden");
    $("<div/>", {
        "class": "beam"
    }).css({
        width: Math.abs(coords[0] - x) + "px",
        left: Math.min(coords[0], x),
        background: "yellow"
    }).appendTo(where);
}

function placeDot(where, x) {
    $(".beam").css("visibility", "hidden");
    $("<div/>", {
        "class": "dot"
    }).css({
        left: x,
        background: "yellow"
    }).appendTo(where);
}

function displayEvent(id, title, color, time) {
    $("<div/>", {
        "class": "event",
        id: "event_" + id,
        title: title
    }).css({
        left: 143 + time,
        background: color
    }).appendTo("#maintimeline");
}

function transferElements(from, to, start, end) {
    var lastIndex = Math.min(end + 1, from.length);
    for (i = start, j = 0; i < lastIndex; i += 1, j += 1) {
        to.push(from[i]);
    }
}

function pagerDisappear(name) {
    $(name).css("background", "#aaa");
    $(name).css("color", "#aaa");
}

function pagerAppear(name) {
    $(name).css("background", "#c8c8c8");
    $(name).css("color", "#333");
}

function displayVideo(id, start, duration, meta) {
    var vidtime, offset = $("#maintimeline").offset().left, leftpos = offset + start, vidline = $("<div/>", {
        "class": "vidline",
        id: "vidline" + id
    }), vidnum = $("<div/>", {
        "class": "vidnum",
        id: "vid" + id,
        text: id,
        title: "Click to show video"
    }).appendTo(vidline), vidmeta = $("<div/>", {
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
    vidtime = $("<div/>", {
        "class": "vidtime"
    }).css({
        left: leftpos,
        width: getOffset(duration)
    }).appendTo(vidline);
    console.log("Offset for duration " + duration + " is " + getOffset(duration));
    vidline.appendTo("#vidlines");
    $("#navtl, .vidtime").click(function(e) {
        var clickleft, pct, tldur;
        console.log("clickity clack");
        clickleft = e.pageX - $("#maintimeline").offset().left;
        pct = clickleft / $("#maintimeline").width();
        tldur = Popcorn.util.toSeconds($("#maintimeline").attr("data-duration"));
        timeline.currentTime(tldur * pct);
        console.log("moving timer to " + tldur * pct);
        $(videos).each(function() {
            var timediff = timeline.currentTime() - this.offset;
            if (timediff < 0) {
                this.pp.pause();
                this.pp.currentTime(0);
                console.log("setting " + this.id + " to 0");
            } else if (timediff > this.offset + this.duration) {
                this.pp.pause();
                this.pp.currentTime(this.pp.duration());
                console.log("setting " + this.id + " to " + this.duration);
            } else if (timeline.currentTime() > this.offset && timeline.currentTime() < this.offset + this.duration) {
                this.pp.currentTime(timediff);
                if (!timeline.media.paused && !$("#vcontain" + this.id).is(":hidden")) {
                    this.pp.play();
                }
                console.log("setting " + this.id + " to " + timediff);
            }
        });
    });
    $(".vidnum").click(function() {
        var thisvid, num;
        $(this).toggleClass("vidactive");
        thisvid = $("#vcontain" + $(this).text());
        thisvid.fadeToggle("fast", "linear");
        if (thisvid.is(":hidden")) {
            Popcorn("#video" + $(this).text()).pause();
        } else {}
        num = $(this).html();
        if ($.inArray(num, videosToDisplay) !== -1) {
            temp = [];
            $.each(videosToDisplay, function(k, v) {
                if (v !== num) {
                    temp.push(v);
                }
            });
            videosToDisplay = [];
            $.each(temp, function(key, val) {
                videosToDisplay.push(val);
            });
        } else {
            videosToDisplay.push(num);
        }
        $(this).toggleClass("vidactive");
        toggleVid($(this).text());
    });
}

function positionVideos(videoList, spaceX, spaceY, spaceWidth, spaceHeight, spacing) {
    var spaceSquareDim = Math.min(spaceHeight, spaceWidth), numberOfVideos = videoList.length, numberY = Math.sqrt(numberOfVideos), numberX = Math.ceil(numberOfVideos / numberY), vidWidth = vidDimCalc(numberX, spaceSquareDim, spacing), vidHeight = vidWidth, spacingX = spacing, spacingY = ySpacingCalc(spaceHeight, vidHeight, numberY), lastRowStart = numberX * (numberY - 1);
    $.each(videoList, function(index, value) {
        var specialPos, pos, current = $("<video>" + "<source src=" + value.file + "type='video/mov'/>" + "<source src=" + value.file + "type='video/mp4'/>" + "</video>");
        $(current).css("width", vidWidth + "px");
        $(current).css("height", vidHeight + "px");
        if (index >= lastRowStart) {
            specialPos = lastRowPositioning(index % numberX, numberOfVideos - lastRowStart, index % numberY, spaceWidth, spaceX, spaceY, spacingY, vidWidth, vidHeight);
            $(current).css("left", specialPos[0]);
            $(current).css("top", specialPos[1]);
        } else {
            pos = regularPositioning(index % numberX, index % numberY, spaceX, spaceY, spacingX, spacingY, vidWidth, vidHeight);
            $(current).css("left", pos[0]);
            $(current).css("top", pos[1]);
        }
        $(current).appendTo("#videos");
    });
}

function ySpacingCalc(spaceHeight, vidHeight, numberY) {
    var fringeLeftover = spaceHeight - vidHeight * numberY;
    return fringeLeftover / numberY;
}

function vidDimCalc(number, spaceDim, spacing) {
    var totalFringeSpace = (number + 1) * spacing, remainingSpace = spaceDim - totalFringeSpace, vidDim = remainingSpace / number;
    return vidDim;
}

function lastRowPositioning(positionInRow, totalInRow, positionInCol, spaceWidth, spaceX, spaceY, spacingY, vidWidth, vidHeight) {
    var xFringeTotal = (totalInRow + 1) * vidWidth, spacingX = spaceWidth - xFringeTotal;
    return regularPositioning(positionInRow, positionInCol, spaceX, spaceY, spacingX, spacingY, vidWidth, vidHeight);
}

function regularPositioning(positionInRow, positionInCol, spaceX, spaceY, spacingX, spacingY, vidWidth, vidHeight) {
    var xPos = positionInRow * vidWidth + (positionInRow + 1) * spacingX + spaceX, yPos = positionInCol * vidHeight + (positionInCol + 1) * spacingY + spaceY, pos = [ xPos, yPos ];
    return pos;
}

function sec2hms(time) {
    var totalSec = parseInt(time, 10), hours = parseInt(totalSec / 3600, 10) % 24, minutes = parseInt(totalSec / 60, 10) % 60, seconds = parseInt(totalSec % 60, 10);
    return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

function toggleVid(id) {
    console.log("toggling " + id);
}

function setupTl(duration) {
    Popcorn.player("baseplayer");
    timeline = Popcorn.baseplayer("#base");
    timeline.endtime = duration;
    $("#maintimeline").attr("data-duration", timeline.endtime);
    timeline.cue(timeline.endtime, function() {
        this.pause();
        console.log("pausing");
    });
    $("video").bind("loadedmetadata", function() {
        var totalwidth, offset, pid = $(this).attr("id"), pop = Popcorn("#" + pid), id = $(this).attr("data-id"), duration = pop.duration();
        $(this).attr("data-duration", pop.duration());
        totalwidth = $("#maintimeline").width();
        offset = getOffset($(this).attr("data-offset"));
        console.log($(this).attr("data-id") + " should trigger at " + $(this).attr("data-offset"));
        displayVideo(id, offset, duration, name);
        timeline.cue($(this).attr("data-offset"), function() {
            if (!timeline.media.paused && $("#vcontain" + id).is(":visible")) {
                console.log("playing" + id);
                pop.play();
            }
        });
    });
    $("#play").click(function() {
        $("#play").toggle();
        $("#stop").toggle();
        console.log(timeline.currentTime() + "of " + timeline.endtime);
        if (timeline.currentTime() < timeline.endtime) {
            console.log("Playing timeline");
            timeline.play();
        }
        $(videos).each(function() {
            var offset = this.offset, duration = this.pp.duration();
            if (timeline.currentTime() > offset && timeline.currentTime() < offset + duration && !$("#vcontain" + this.id).is(":hidden")) {
                this.pp.play();
            }
        });
    });
    $("#stop").click(function() {
        timeline.pause();
        $("#play").toggle();
        $("#stop").toggle();
        $(videos).each(function() {
            this.pp.pause();
        });
    });
    timeline.on("timeupdate", function() {
        var fulldur = timeline.endtime, totalwidth = $("#maintimeline").width(), pct = this.currentTime() / fulldur * 100, newoffset = totalwidth * this.currentTime() / fulldur;
        $(".timeloc").text(sec2hms(this.currentTime()));
        $("#timepos").css("left", newoffset + $("#maintimeline").offset().left);
    });
}

function displayVids(files, activeFiles, pageNumber, numVideosToDisplay) {
    activeFiles = [];
    transferElements(files, activeFiles, (pageNumber - 1) * numVideosToDisplay, pageNumber * numVideosToDisplay - 1);
    $.each(activeFiles, function(key, val) {
        var vid;
        $.getJSON(val, function(data) {
            var offset = data.Timeline.Offset, length = data.Temporal.Length, id = data.ID.VideoID, name = data.ID.Name;
            vid = new video(offset, duration, id, name);
            displayVideo(id, offset, duration, name);
        });
    });
}

function validDate(item) {
    if (item.mcDate > 2e3) {
        return item.mcDate;
    } else {
        return item.fmDate;
    }
}

function formatDate(exifDate) {
    var zone, d, date = exifDate.toString(), str = date.split(" "), datesplit = str[0].split(":"), year = datesplit[0], month = datesplit[1] - 1, day = datesplit[2], timesplit = str[1].split(":"), hour = timesplit[0], minute = timesplit[1], second = timesplit[2];
    if (timesplit[2].indexOf("-") != -1) {
        zone = timesplit[2].split("-");
        second = zone[0];
        zone = zone[1].split(":");
        zone = zone[0];
        hour -= zone;
        hour = hour < 10 ? "0" + hour : hour;
    }
    d = new Date(year, month, day, hour, minute, second, 0);
    return d;
}

function getOffset(time) {
    console.log("offset of " + time);
    return $("#maintimeline").width() * time / Popcorn.util.toSeconds($("#maintimeline").attr("data-duration"));
}

function formatDuration(duration) {
    var split, hr, min, sec, dur, seconds;
    if (duration.indexOf(":") != -1) {
        split = duration.split(":");
        hr = split[0];
        min = split[1];
        sec = +split[2];
        dur = hr * 60 * 60 + min * 60 + sec;
        return dur;
    } else if (duration.indexOf("s") != -1) {
        seconds = duration.split(".");
        dur = seconds[0];
        return dur;
    } else {
        console.log("Some weird duration, couldn't format");
    }
}

function setupVideos(json) {
    $.getJSON(json, function(collecdata) {
        var filenames = collecdata.files, l = filenames.length;
        $.each(filenames, function() {
            var item = {};
            item.filename = "" + this;
            $.getJSON("metadata/" + this + ".json", function(itemdata) {
                item.tcDate = formatDate(itemdata[0].TrackCreateDate);
                item.tmDate = formatDate(itemdata[0].TrackModifyDate);
                item.fmDate = formatDate(itemdata[0].FileModifyDate);
                item.mcDate = formatDate(itemdata[0].MediaCreateDate);
                item.mDate = formatDate(itemdata[0].MediaModifyDate);
                item.duration = formatDuration(itemdata[0].Duration);
                item.validDate = validDate(item);
                if (item.validDate.getTime() < earliest.getTime()) {
                    console.log(item.validDate + "is earlier than " + earliest);
                    earliest = item.validDate;
                }
                console.log("pushing " + item.filename);
                videos.push(new video(item.validDate, item.duration, videos.length + 1, item.filename));
                l--;
                console.log(l);
                if (l == 0) {
                    $.each(videos, function() {
                        this.offset -= earliest.getTime() / 1e3 - 3;
                        $("#video" + this.id).attr("data-offset", this.offset);
                        console.log(this.id + ": new offset is " + this.offset + " fulldur is " + fulldur + " duration is " + this.duration);
                        if (this.duration + this.offset > fulldur) {
                            console.log("tweeeeet");
                            fulldur = this.duration + this.offset + 15;
                            console.log("fulldur " + fulldur);
                        }
                    });
                    console.log("Full timeline duration is " + sec2hms(fulldur) + "(" + fulldur + ")");
                    $("#maintimeline").attr("data-duration", fulldur);
                    setupTl(fulldur);
                }
            });
        });
    });
}