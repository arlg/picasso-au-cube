P.Resizer = (function(){

    var
        _WH = 0,
        _WW = 0,

        _$content,
        _$autoLeft,
        _$canvases,
        _$autoLeft,

        _SVGRATIO = 1368/868,

        _autoLeftWnum,
        _autoLeftHnum;

    function init(){

        _$content = $('.content-wrapper');
        _$autoLeft = $('.mod-auto-step.step-facechange .left-side');
        _$canvases = $('#canvasvideo, #offcanvas');
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

        var vals = canvasSizes();
        
        P.Portrait.initalize_app( true );

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


    return{
        init:init,
        canvasSizes:canvasSizes
    };

})();