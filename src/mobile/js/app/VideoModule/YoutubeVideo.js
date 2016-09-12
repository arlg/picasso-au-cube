P.YoutubeVideo = (function(){
    var _player,
        _isReady,
        _lockStart = false,  // Used if the pause is fired before start
        _$overlay,
        _isAPILoaded
        _prevEventData = 5000;


    function init(){
        
        _isReady = false;
        _isAPILoaded = false;

        _$overlay = $('.mod-video-overlay');
        _$closeVideo = $('.close-video');

        // 2. This code loads the IFrame Player API code asynchronously.
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        _initEvents();
    }

    function _initEvents(){

        _$overlay.on('click', function(){    
            _onOverlayClicked(false);
        });


        _$closeVideo.on('click', function(){

            _onOverlayClicked(true);
        });
    }

    function _onOverlayClicked( isCloseBtn ){

        if( _player ){
            _player.pauseVideo();
            stopVideo();
        }

        $('.mod-video-overlay').removeClass('active');
        
        P.event_aggregator.trigger( 'onOverlayClicked' );

        if(  isCloseBtn === true ){
            P.VideoWrapper.toggleVideoWrapper( 'hide' );
        }

    }

    function changeVideo( id ){
        console.log('changevideo :: ' + id);

        _$overlay.addClass('active');

        // If API not available, recall it later
        if( _isAPILoaded === false ){

            setTimeout(function(){
                changeVideo( id );
            }, 1000);

            return;

        }

        // Else we rereate the embed
        // if( _player ){

        //     _player.destroy();
        //     $('.mod-video iframe').unbind().remove();
        //     $('.mod-video').append('<div id="player"></div>');
        //     _player = null;

        // }

        $('.mod-video iframe').unbind().remove();
        $('.mod-video').append('<div id="player"></div>');

        // _player = new YT.Player('player', {
        //     height: '100%',
        //     width: '100%',
        //     videoId: id,
        //     playerVars: {
        //         controls:1,
        //         showinfo:1,
        //         modestbranding: 1
        //     },
        //     events: {
        //       'onReady': _onPlayerReady,
        //       'onStateChange': _onPlayerStateChange
        //     }
        // });

        // For mobiles : use iframe embed 
        $('.mod-video #player').append('<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/'+id+'?showinfo=0" allowfullscreen frameborder="0"></iframe>');

        P.VideoWrapper.toggleVideoWrapper( 'show' );

        //
    
        $('.mod-video').css({
            marginTop: ( $(window).height() / 2 - $('.mod-video').outerHeight()/2 ) + "px"
        });
    }

    function onYouTubeIframeAPIReady(){

        _isAPILoaded = true;

    }

    // 4. The API will call this function when the video player is ready.
    function _onPlayerReady() {
            
        _isReady = true;

        if( P.Config.isTouchDevice === false ){

            _player.playVideo();    
        }
        

    }

    // 5. The API calls this function when the player's state changes.
    function _onPlayerStateChange(event) {
        
        if(event.data === 0) {          
            // End
            // _playFor1sec();
        }else if( event.data === 1 ) {
            //Playing
            _isPlaying();
        }else if( event.data === 2 && _prevEventData === 1 ){
            _isPaused();
        }

        _prevEventData = event.data;

    }

    function _isPlaying(){
        
        _$overlay.addClass('active');

    }

    function _isPaused(){

        _$overlay.removeClass('active');
    }

    function stopVideo() {

        if ( _player )
            _player.stopVideo();

    }

    function pauseVideo() {

        if ( !_player ){

            _lockStart = true;

        }else{
            _player.pauseVideo();
        }

    }

    function playVideo() {

        _player.playVideo();

    }

    // function getIsReady(){
    //     return _isReady;
    // }

    return{
        init:init,
        onYouTubeIframeAPIReady:onYouTubeIframeAPIReady,
        changeVideo:changeVideo,
        stopVideo:stopVideo,
        pauseVideo:pauseVideo,
        playVideo:playVideo
    };

})();

function onYouTubeIframeAPIReady() {
      
      P.YoutubeVideo.onYouTubeIframeAPIReady();
}