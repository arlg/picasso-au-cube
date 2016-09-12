P.BackgroundAutoModule = (function(){

    var _SNAP,
        _autoBackground,
        _ButtonMore,
        

        _ButtonAllPics,
        _DomButtonAllPics,
        _ButtonAllPicsText,
        _$autoWrapper;

    function init(){        
            
        console.log('Init Background Auto');

        _autoWrapperSVG = $('svg #autoportrait .rect-sizer');

        _autoWrapperSVG.addClassSVG('active');

        _$autoWrapper = $('.mod-auto-wrapper');
        
        _DomButtonAllPics = $('.section-main-02 .info-right');

        _SNAP = P.BackgroundHandler.getSNAP();
        
        _autoBackground = _SNAP.select('#autoportrait #background_1_');
        _autoBackground.attr('display', 'block');

        _ButtonAllPicsText = _SNAP.select('#interactive_layers .info-right');
        _ButtonAllPics = _SNAP.select('#background #poly-38');
        _ButtonAllPics.attr('cursor', 'pointer');

        P.BackgroundHandler.changeBackground( P.Config.currentId );    

        P.event_aggregator.bind( 'onchangeBackgroundComplete:2', function(){

            _initEvents();        

        } );

        P.Resizer.AutoWrapperResize();

    }

    function _initEvents(){

        _ButtonAllPics
        .mouseover(function(e){
            _ButtonAllPics.animate({opacity: 0}, 100);
            _ButtonAllPicsText.attr('fill', '#000000');
        })
        .mouseout(function(){
            _ButtonAllPics.animate({opacity: 1}, 300);
            _ButtonAllPicsText.attr('fill', '#FFFFFF');
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }

            P.PortraitController.showGallery();
        });

        P.event_aggregator.bind( 'onSeeMoreOpen', function(){
            _onSeeMoreOpen();        
        });

        P.event_aggregator.bind( 'onSeeMoreClose', function(){
            _onSeeMoreClose();        
        });

    }

    function _onSeeMoreOpen(){
        
        _$autoWrapper.hide();
        
        _autoBackground.attr('display', 'none');

    }

    function  _onSeeMoreClose(){
        _$autoWrapper.show();
        _autoBackground.attr('display', 'block');
    }

    function close(){
        
        console.log('close backgroundAutoModule');

        _autoWrapperSVG.removeClassSVG('active');
        
        _ButtonAllPics.unmouseover();
        _ButtonAllPics.unmouseout();
        _ButtonAllPics.unmouseup();
        _ButtonAllPics.attr('cursor', 'default');
        _ButtonAllPics = null;

        _autoBackground.attr('display', 'none');

        P.event_aggregator.unbind( 'onchangeBackgroundComplete:2');
        P.event_aggregator.unbind( 'onSeeMoreOpen');
        P.event_aggregator.unbind( 'onSeeMoreClose');

    }

    return{
        init:init,
        close:close
    };

})();