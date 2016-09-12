P.VideoAllModule = (function(){

    function init(){
        console.log('Init VideoAllModule');
        _initEvents();
    }

    function _initEvents(){

        P.event_aggregator.bind( 'onOverlayClicked', function(){
            
            P.VideoWrapper.toggleVideoWrapper( 'hide' );
            onVideoClose();
        });

    }

    function onVideoLaunch( _id ){

        $('.section-main-allvideos .video-name').removeClass('active');
        $('.section-main-allvideos .video-name[data-youtubeid="'+_id+'"]').addClass('active');
        $('.section-main-allvideos .page-title').addClass('inactive');

    }

    function onVideoClose(){


        $('.section-main-allvideos .video-name').removeClass('active');
        $('.section-main-allvideos .page-title').removeClass('inactive');

    }

    function close(){
        console.log('Close VideoAllModule');

        P.event_aggregator.unbind( 'onOverlayClicked' );
        P.VideoWrapper.toggleVideoWrapper( 'hide' );

    }

    return{
        init:init,
        onVideoLaunch:onVideoLaunch,
        onVideoClose:onVideoClose,
        close:close
    };

})();