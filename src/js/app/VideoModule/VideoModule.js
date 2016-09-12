P.VideoModule = (function(){

    var 
        _$listItem,
        _$listWrapper,
        
        _$relaunchBtn,
        _$showAllButton,
        _$videoPlayButton,

        _catHeight = 0,
        _wrapperHeight = 0,
        _max = 0,
        _currentId = 0,
        _loadVideoTimeout,
        _isFirstRoulette,
        _isSeeMoreOpen = false,

        _arrayIdSeen,

        _demoTimer,
        _demoCounter;

    function init(){

        _demoCounter = 0;
        _isFirstRoulette = true;

        _arrayIdSeen  = [];

        _$listItem = $('.section-main.active header li');
        _$listWrapper = $('.section-main.active header ul');
        _$relaunchBtn = $('.action-button.button-relaunch');
        _$videoPlayButton = $('.video-play-button');

        P.VideoWrapper.toggleVideoWrapper('show');

        _max = _$listItem.length;

        setTimeout(function(){
            initPosition();    
        }, 200);
        
        _initEvents();

        if( P.Config.isFirstTimeVideoModule === true){
            _initializeDemo();
        }

    }

    function _fakeRelaunchClick(){
        
        _demoCounter++ ;
        if( _demoCounter === 3 ){
            P.Config.isFirstTimeVideoModule = false;
        }

        if( _demoCounter === 4 ){
            P.VideoWrapper.toggleVideoWrapper('show');
            _changeWheel();
            return; 
        }

        _$relaunchBtn[0].click();

        _demoTimer = setTimeout( function(){

            _fakeRelaunchClick();

        }, 1000);

    }

    function _initializeDemo(){

        P.VideoWrapper.toggleVideoWrapper('hide');

        _isFirstRoulette = false; // We want animation

        _demoTimer = setTimeout( function(){

            _fakeRelaunchClick();

        }, 1000);
        

    }

    function close(){
        console.log('Close VideoModule');

        P.YoutubeVideo.stopVideo();
        P.VideoWrapper.toggleVideoWrapper( 'hide' );

        _max = 0;
        clearTimeout(_loadVideoTimeout);
        clearTimeout(_demoTimer);
        _$relaunchBtn.off('click');
        _$videoPlayButton.off('click');

        P.event_aggregator.unbind( 'onSeeMoreOpen');
        P.event_aggregator.unbind( 'onSeeMoreClose');
        P.event_aggregator.unbind( 'onOverlayClicked');

    }

    function _initEvents(){

        _$relaunchBtn.on('click', function(){
            _onRandomRoulette();
        });

        _$videoPlayButton.on('click', function(){
            _onShowVideo();
        });

        P.event_aggregator.bind( 'onSeeMoreOpen', function(){
            _onseeMoreOpen();
        });

        P.event_aggregator.bind( 'onSeeMoreClose', function(){
            _onseeMoreClose();
        });

        P.event_aggregator.bind( 'onOverlayClicked', function(){
            _onHideVideo();
        });

    }

    function _onseeMoreOpen(){
        $('.mod-main-module header ul li.active').nextAll().hide();
        _$videoPlayButton.removeClass('isvisible');
        _isSeeMoreOpen = true;

        P.YoutubeVideo.pauseVideo();

    }

    function _onseeMoreClose(){
        $('.mod-main-module header ul li').show();
        _$videoPlayButton.addClass('isvisible');
        _isSeeMoreOpen = false;

    }

    function _onHideVideo(){

        P.YoutubeVideo.pauseVideo();

        P.VideoWrapper.toggleVideoWrapper( 'hide' );

        _$videoPlayButton.addClass('isvisible');

    }

    function _onShowVideo(){

        P.VideoWrapper.toggleVideoWrapper( 'show' );

        if( P.Config.isTouchDevice === false ){
            P.YoutubeVideo.playVideo();
        }else{
            //Change youtube video
            var id = _$listItem.eq( _currentId ).attr('data-youtubeid');
            loadVideo( id );
        }

        _$videoPlayButton.removeClass('isvisible');

    }

    function _onRandomRoulette(){

        if( _isSeeMoreOpen === true  ) return;

        var nextId = Math.floor( ( Math.random() * _max ), 10 );

        if( nextId === _currentId  ){
            _onRandomRoulette();
            return;
        }

        // Check if already seen
        _currentId = nextId;

        if( P.Config.isFirstTimeVideoModule === false ){

            if( _arrayIdSeen.length === _max ){
                _arrayIdSeen.length = 0;
            }

            if( _arrayIdSeen.indexOf( _currentId ) > -1 ){
                console.log(_currentId + " Already seen, Next");
                _onRandomRoulette();
                return;

            }else{

                _arrayIdSeen.push( _currentId );
                console.log('--> Video ' + _arrayIdSeen);
            }

        }

        _changeWheel();

        // Xiti
        var tag = '';
        if(  P.Config.currentId === 1 ){
            tag = 'picasso_au_cube::si_picasso_etait::relancer';
        }else{
            tag = 'picasso_au_cube::si_picasso_m_etait_reinvente::relancer';
        }

        xt_med('C',xtn2Value,tag,'A');

    }

    function initPosition( ){

        _wrapperHeight = _$listWrapper.outerHeight();
        _catHeight = _$listItem.outerHeight();
        
        _currentId = parseInt( ( (_$listItem.length/2) - 1 ) , 10);

        resizeList();
        
        _onRandomRoulette();
    }

    function _changeWheel(){
            
        _$listItem
            .removeClass('active one two three')
            .eq( _currentId )
            .addClass('active')
            .prev().addClass('one')
            .prev().addClass('two')
            .prev().addClass('three')
            .end().end().end()
            .next().addClass('one')
            .next().addClass('two')
            .next().addClass('three');

        // Calculte pos
        var curr = _$listItem.eq( _currentId ), 
            prevs = curr.prevAll();

        var gotoid = 0;

        prevs.each(function(i){

            gotoid+= $(this).height() + 2;

        });

        if( _isFirstRoulette === false ){
            _$listWrapper.addClass('hastrasition');
        }

         _$listWrapper.css({
            '-moz-transform': 'translate(0, -'+gotoid+'px)',
            '-ms-transform': 'translate(0, -'+gotoid+'px)',
            '-webkit-transform': 'translate(0, -'+gotoid+'px)',
            'transform': 'translate(0, -'+gotoid+'px)'
        });

         if( P.Config.isFirstTimeVideoModule === true ) return;


        //Wait for some time and Change youtube video
        _loadVideoTimeout = setTimeout(function(){
            var id = _$listItem.eq( _currentId ).attr('data-youtubeid');
            loadVideo( id );    
        }, 600);


        _isFirstRoulette = false;
    }

    function _showAllVideos(){

        P.VideoWrapper.toggleVideoWrapper( 'hide' );

        P.BackgroundHandler.showAllVideo();

    }

    function loadVideo( id ){
        
        P.YoutubeVideo.changeVideo( id );

    }

    function getCurrentId(){
        return _currentId;
    }

    function resizeList(){

        if( !_$listWrapper ) return;

        var arr = [], max = 0;

        _$listWrapper.css('width', '100%');

        _$listItem.each(function(){

            var wasActive = false;

            if( $(this).hasClass('active') ){
                wasActive = true;
            }

            $(this).addClass('active');
            arr.push($(this).outerWidth());

            if( wasActive === false )
                $(this).removeClass('active');
            
        });

        max = Math.max.apply(Math, arr);

        _$listWrapper.css('width', max);  

    }

    return{
        init:init,
        close:close,
        loadVideo:loadVideo,
        resizeList:resizeList,
        getCurrentId:getCurrentId
    };

})();