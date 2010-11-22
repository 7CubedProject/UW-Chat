
jQuery(function(){
  
});

function submitRoom() {
    var fade_speed = 1000;
    var slide_speed = 1000;          
    
    $("#toolbar").attr("style", "in-line");
    $("#logo").animate({marginLeft:'0px'}, slide_speed, function(){
        $("#uwc_chat").animate({opacity:"1"},slide_speed,function(){});
        $("#toolbar").animate({opacity:"1"},slide_speed,function(){});
        $("#log").animate({opacity:"1"},slide_speed,function(){});
        $("#uwc_divider").animate({opacity:'1'},slide_speed,function(){});
        $("#uwc_splash").attr('style', 'position:fixed');
        $("#uwc_splash").width('100%');
    });
    $("#uwc_splash").animate({marginLeft:'0px', marginRight:'0px',marginTop:'0',left:'0px',top:'0px'},slide_speed,function(){});
    $("#connect").animate({marginTop:'-27px'},slide_speed,function(){});
}
