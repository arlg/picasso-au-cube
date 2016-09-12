P.VideoWrapper = (function(){

    var _$videoWrapper,
        _wasActive;

    function init(){

        _$videoWrapper = $('.mod-video');

        _wasActive = false;

        P.event_aggregator.bind( 'onSeeMoreOpen', function(){
            _onseeMoreOpen();
        } );

        P.event_aggregator.bind( 'onSeeMoreClose', function(){
            _onseeMoreClose();
        } );

    }

    function _onseeMoreOpen(){
        if( _$videoWrapper.hasClass('active') ){
            _wasActive = true;
            toggleVideoWrapper('hide');
        }
    }
    function _onseeMoreClose(){
        if( _wasActive === true ){
            _wasActive = false;
            toggleVideoWrapper('show');
        }
    }

    // State : show or hide
    function toggleVideoWrapper( state ){

        if( state === 'show' ){
            setTimeout(function(){
                _$videoWrapper.addClass('active');    
            }, 1000);
        }
        else
            _$videoWrapper.removeClass('active');

    }

    return{
        init:init,
        toggleVideoWrapper:toggleVideoWrapper
    }

})();