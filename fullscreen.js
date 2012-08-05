$(document).ready(function(){  
      
       //Adjust height of overlay to fill screen when page loads  
       //$("#fullscreen").css("height", $(document).height());  
      
 
      
       //When the message box is closed, fade out  
       $("#xbox").click(function(){
          $("#fsvid").remove();
          $("#fullscreen").fadeOut();  
          $("body").css("overflow", "visible");
          return false;  
       });  
      
    });  
      
    /*Adjust height of overlay to fill screen when browser gets resized  
    $(window).bind("resize", function(){  
       $("#fullscreen).css("height", $(window).height() - $(window).scrollTop());  
       
    }); 
*/
function loadFullscreen(id){
    console.log("FS for id " + id);
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
    console.log("clicked " + id)
    console.log(ctime);
    var videotag = $("<video/>", { 'id': 'fsvid', "controls": true }).appendTo('#fsvidholder');    
    Rashomon.videos[id].webm.appendTo(videotag);
    Rashomon.videos[id].mp4.appendTo(videotag);
    
      $("#fsvid").css("left",  $(window).width() / 2  -  $("#fsvid").width() / 2 );
    var fspop = Popcorn("#fsvid");
    fspop.on("loadedmetadata", function() {
      $("#fsvid").css("left",  $(window).width() / 2  -  $("#fsvid").width() / 2 );
      fspop.pause(ctime);
      
    });
    fspop.on("canplay", function() {
      $("#fsvid").css("left",  $(window).width() / 2  -  $("#fsvid").width() / 2 );
      $("#fsvid").css("opacity", 1);
      
    });

    
}
