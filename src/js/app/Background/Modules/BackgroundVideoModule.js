P.BackgroundVideoModule = (function(){

    var _SNAP,
        _ButtonAllFilms,
        _DomButtonAllFilms;


    function init(){        
        
        console.log('Init Background VideoModule');

        _SNAP = P.BackgroundHandler.getSNAP();
        
        _ButtonAllFilms = _SNAP.select('#background path#poly-50');
        _ButtonAllFilms.attr('cursor', 'pointer');

        _DomButtonAllFilms = $('.mod-main-module.active .see-all-button');

        P.BackgroundHandler.changeBackground( P.Config.currentId );    
        
        P.event_aggregator.bind( 'onchangeBackgroundComplete:' + P.Config.currentId, function(){

            _initEvents();        

        } );

    }

    function _initEvents(){

        _ButtonAllFilms
        .mouseover(function(){
            _ButtonAllFilms.animate({opacity:0}, 100);
            _DomButtonAllFilms.addClass('active');
        })
        .mouseout(function(){
            _ButtonAllFilms.animate({opacity: 1 }, 300);
            _DomButtonAllFilms.removeClass('active');
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }

            $('.mod-main-module.active .see-all-button').trigger('click');
        });

    }


    function close(){

        console.log('remove BackgroundVideoModule');

        P.event_aggregator.unbind( 'onchangeBackgroundComplete' + P.Config.currentId, null, this );

        P.BackgroundCommon.close();

        _ButtonAllFilms.attr('cursor', 'default');
        _ButtonAllFilms.attr('opacity', 1);
        _ButtonAllFilms.unmouseover();
        _ButtonAllFilms.unmouseout();
        _ButtonAllFilms.unmouseup();

        
    }

    return{
        init:init,
        close:close
    };

})();