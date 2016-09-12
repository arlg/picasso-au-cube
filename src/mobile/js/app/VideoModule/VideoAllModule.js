P.VideoAllModule = (function(){

    function init(){
        console.log('Init VideoAllModule');

        $('.ascenceur-inside').mCustomScrollbar();

        _checkAlreadySeen();
        _initEvents();
    }

    function _initEvents(){

        P.event_aggregator.bind( 'onOverlayClicked', function(){
            
            P.VideoWrapper.toggleVideoWrapper( 'hide' );
            onVideoClose();
        });

        $('.ascenceur-wrapper li').on('click', function(){

            _onOpenVideo($(this).attr('data-youtubeid'));

        });

    }

    function onVideoLaunch( _id ){

        $('.section-main-allvideos .video-name[data-youtubeid="'+_id+'"]').addClass('active');
        $('.section-main-allvideos .page-title').addClass('inactive');

    }

    function onVideoClose(){
        $('.section-main-allvideos .video-name').removeClass('active');
        $('.section-main-allvideos .page-title').removeClass('inactive');

    }

    function _onOpenVideo( id ){

        var currentStorage;
           
        currentStorage = P.Storage.get('allvideosSeen');
        
        if( currentStorage.indexOf( id ) === -1 ){

            currentStorage.push( id );
            P.Storage.insert('allvideosSeen', currentStorage);

        }

        _checkAlreadySeen();

        onVideoLaunch(id);
        P.YoutubeVideo.changeVideo( id );

    }

    function _checkAlreadySeen(){

        var Arr = P.Storage.get('allvideosSeen');
        if( !Arr ) return;
        $('.ascenceur-inside li').each(function(i){

            for (var y = Arr.length - 1; y >= 0; y--) {
                
                if( $(this).attr('data-youtubeid') === Arr[y] ){

                    $(this).addClass('isseen');
                
                }

            }

        });

    }

    function close(){
        console.log('Close VideoAllModule');

        P.event_aggregator.unbind( 'onOverlayClicked' );
        P.VideoWrapper.toggleVideoWrapper( 'hide' );

    }

    return{
        init:init,
        onVideoLaunch:onVideoLaunch,
        close:close
    };

})();