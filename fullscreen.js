$(document).ready(function(){  
      
       //Adjust height of overlay to fill screen when page loads  
       $("#fullscreen").css("height", $(document).height());  
      
       //When the link that triggers the message is clicked fade in overlay/msgbox  
       $(".rashomon").click(function(){ 
	  console.log("CLICKITY CLACK"); 
          $("#fullscreen").fadeIn();  
          return false;  
       });  
      
       //When the message box is closed, fade out  
       $("#closefs").click(function(){  
          $("#fullscreen").fadeOut();  
          return false;  
       });  
      
    });  
      
    //Adjust height of overlay to fill screen when browser gets resized  
    $(window).bind("resize", function(){  
       $("#fullscreen").css("height", $(window).height());  
    }); 

function loadFullscreen(target){
    console.dir(target);
    var id = target.id;
    console.log("clicked " + id)
    var video = $("#video" + id);
    var ctime = Popcorn("#video" + id).currentTime();
    var sources = video.children();
    timeline.pause();
    $("#fullscreen").fadeIn();
    var videotag = $("<video/>", { 'class': 'fsvid', "controls": true }).appendTo('#fullscreen');
    sources.appendTo(videotag);
    if (video.hasClass('vert')) {
        videotag.addClass('fsvert');
    } else if (video.hasClass('hor')){
        videotag.addClass('fshor');
    }
    var pop = Popcorn(".fsvid");
    pop.currentTime(ctime);
}
