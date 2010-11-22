                              
var ac; // The AutoComplete Object

function InitRooms() {
    // TODO(becmacdo): Fill this up in a better way
   // ac.setOptions({ lookup: 'RCH101,MC4020'.split(',') });
}

function onLoad () {
    InitRooms();
}

jQuery(function(){
  // 
  //   // TODO(becmacdo): Fill in with what we want selection to do.
  //   var onAutocompleteSelect = function(value, data) {
  //     $('#selection').html('<img src="\/global\/flags\/small\/' + data + '.png" alt="" \/> ' + value);
  //     //alert(data);
  //   }
  // 
  // var ac_options = {
  //     serviceUrl: '/projects/autocomplete/service/autocomplete.ashx',
  //     width: 300,
  //     delimiter: /(,|;)\s*/,
  //     onSelect: onAutocompleteSelect,
  //     deferRequestBy: 0, //miliseconds
  //     params: { country: 'Yes' },
  //     noCache: false //set to true, to disable caching
  //   };
  // 
  //   ac = $('#uwc_room').autocomplete(ac_options);
  // 
  // 
  //   // I have no clue what this does ..
  //   $('#navigation a').each(function() {
  //     $(this).click(function(e) {
  //       var element = $(this).attr('href');
  //       $('html').animate({ scrollTop: $(element).offset().top }, 300, null, function() { document.location = element; });
  //       e.preventDefault();
  //     });
  //   });
});

function submitRoom() {
    /*var splash = document.getElementById("uwc_splash");
    var chat   = document.getElementById("uwc_chat");
    var log    = document.getElementById("log");
    var toolbar = document.getElementById("toolbar");

    //splash.style.display = "none";
    $(splash).addClass("top");
 
    chat.style.display   = "inline";
    log.style.display ="inline";
    toolbar.style.display ="inline";    */
    
    var fade_speed = 1000;
    var slide_speed = 1000;          
    
    $("#toolbar").attr("style", "in-line");
    $("#logo").animate({marginTop:'-140px', marginLeft:'-800px'}, slide_speed, function(){});
    $("#enter_room").animate({marginTop:'-30px', marginLeft:'-300px'}, slide_speed, function(){});
    $("#uwc_room_box").animate({marginTop:'-25px', marginLeft:'210px'}, slide_speed, function(){
        $("#uwc_chat").animate({opacity:"1"},fade_speed,function(){});
        $("#toolbar").animate({opacity:"1"},fade_speed,function(){});
        $("#log").animate({opacity:"1"},fade_speed,function(){});
        
        
    
    
    
    });
    
    
}
