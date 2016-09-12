P.Resizer = (function(){

    var
        _$svg,
        _WH = 0,
        _WW = 0,

        _$content,
        _$autoLeft,
        _$canvases,
        _$autoLeft,

        _SVGRATIO = 1368/868,

        _autoLeftWnum,
        _autoLeftHnum,
		
		_autoWrapperSVG;

    function init(){

        _$content = $('.content-wrapper');
        _$autoLeft = $('.mod-auto-step.step-facechange .mod-auto-left');
        _$canvases = $('#canvasvideo, #offcanvas');
        _$autoWrapper = $('.mod-auto-wrapper');

        _$svg = $('#svg');
		
		_autoWrapperSVG = $('svg #autoportrait .rect-sizer');

        _onResize();

        //Resize BG
        var lazyLayout = _.debounce(_onResize, 100);
        $(window).resize(lazyLayout);

    }

    function _onResize(){

        _WH = $(window).height();
        _WW = $(window).width();

        // Adjusting with the header
        var contentHeight = ( _WW < 880 ) ? _WH - 50 : _WH - 100;

        // BG
        if( _$content.hasClass('isfullscreen') ){
            _$content.css('height', '100%');
        }else{
            _$content.css('height', contentHeight + "px"  );    
        }
        
        P.Portrait.initalize_app( true );

        resizeSVG();

        // Resize list views in VideoModule
       	P.VideoModule.resizeList();

       	AutoWrapperResize();

    }

    function canvasSizes(){

        _$autoLeft.css({
            'height' :  parseInt(( _$autoLeft.width() * 350 )  / 480, 10) + 'px'
        });


        var autoLeftW = _$autoLeft.css('width'),
            autoLeftH = _$autoLeft.css('height'),
            _autoLeftWnum = parseInt(autoLeftW, 10),
            _autoLeftHnum = parseInt(autoLeftH, 10);

        _$canvases.attr('width', autoLeftW);
        _$canvases.attr('height', autoLeftH);
		
        return { _w: _autoLeftWnum, _h: _autoLeftHnum };

    }

    function resizeSVG(){

        // Background 
        
        if(  !P.BackgroundHandler.getSNAP() ) return;

        if(   _WW > 1100  && _WH > 630 ){

            if( ( _WW / _WH ) > _SVGRATIO ) {
                P.BackgroundHandler.getSNAP().attr('preserveAspectRatio', '');
                P.BackgroundHandler.getSnapClip().attr('preserveAspectRatio', '');

                $('html').addClass('no-ratio');

            }

        }else{
            P.BackgroundHandler.getSNAP().attr('preserveAspectRatio', 'xMinYMin slice');
            P.BackgroundHandler.getSnapClip().attr('preserveAspectRatio', 'xMinYMin slice');
            $('html').removeClass('no-ratio');
        }


    }

    function AutoWrapperResize(){
        
        _$autoWrapper.css({
            left: parseInt(_autoWrapperSVG.offset().left, 10) + 'px',
            top: parseInt(_autoWrapperSVG.offset().top - 100, 10) + 'px'
        });
        
    }

    return{
        init:init,
        canvasSizes:canvasSizes,
        resizeSVG:resizeSVG,
        AutoWrapperResize:AutoWrapperResize
    };

})();