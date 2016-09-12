/*
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     width="100%" height="100%" viewBox="-349.801 0.25 1462 824" enable-background="new -349.801 0.25 1462 824"
     xml:space="preserve" preserveAspectRatio="xMinYMin slice">
*/

P.BackgroundHandler = (function(){

    var _BGPolygons,
        _BGPolygonsInside, 
        _BGPolygonsOutside,
        _VIDEOPolygons,
        _SNAP,
        _SNAPCLIP,
        _BGPolyLengthInside,
        _BGPolyLengthOutside,

        _$svgElement,

        _color,
        _colorsArray = [],
        _reversedColorsArray = [];

    function init(){

        _SNAP = Snap("#svg svg");
        _SNAPCLIP = Snap("#svgclip svg");

        //Push all polygons in ordered array
        _BGPolygons = _SNAP.selectAll("#background path");
        _VIDEOPolygons = _SNAP.selectAll('#allvideos path');

        _BGPolygonsInside = _SNAP.selectAll("#background #inside path");
        _BGPolygonsOutside =  _SNAP.selectAll("#background #outside path");

        _BGPolyLengthInside = _BGPolygonsInside.length;
        _BGPolyLengthOutside= _BGPolygonsOutside.length;

        _$svgElement = $('.svgelement');

        P.BackgroundCommon.init();

        P.Resizer.resizeSVG();

         // Change the scale of the clips 
        var clips = _SNAPCLIP.selectAll('path');

        clips.forEach( function(elem) {
            elem.transform( 's0.98' );
        });

    
    }


    function changeBackground( id ){

        _$svgElement.removeClassSVG('isvisible');

        $('.section-footer').attr('data-id', id);

        _colorsArray = null;
        _colorsArray = P.BackgroundData.states[id].slice(0).reverse();

        var x = _BGPolyLengthInside - 1;
        while( x >= 0 ){

            _color = _colorsArray[x];
            var el = _BGPolygonsInside[x];

            animateBG( _color, el );

            x--;
        }

        for (var y = _BGPolyLengthOutside - 1;  y >= 0;  y--) {

            _color = _colorsArray[y];
            // Remove Black
            if( _color === '#000000' ) 
                _color = _colorsArray[y+1];

            _BGPolygonsOutside[y].animate({fill: _color}, 500);

        }

        // Once done, send an event
        setTimeout(function(){
            
            changeBackgroundElements( id );

            P.event_aggregator.trigger( 'onchangeBackgroundComplete:' + id );
            P.event_aggregator.trigger( 'onchangeBackgroundCompleteCommon');
            
        }, 510);
        
    }

    function animateBG( _color, _el ){

        setTimeout(function(){
            _el.animate({ fill: _color }, getRandomArbitrary(0, 400), mina.easeout );    
        }, getRandomArbitrary(0, 800) );
        
    }

    //*** GETTERS **//
    function getSNAP(){
        return _SNAP;
    }

    function getBGPolys(){
        return _BGPolygons;
    }

    function getVideoPolys(){
        return _VIDEOPolygons;
    }

    function changeBackgroundElements( id ){
    console.log('changeBackgroundElements');
        // Filters BAckground svg elements to display appropriate ones on the page
        $('.svgelement').each(function(){
            
            $(this).removeClassSVG('isvisible');

            var modules = $(this).attr('data-module');
            
            if ( ( modules.indexOf( ( id+'' ) ) > -1 ) === true ){
                $(this).addClassSVG('isvisible');
            }

        });
    }

     function getSnapClip(){
        return _SNAPCLIP;
    }

    return{
        init:init,
        changeBackground:changeBackground,
        changeBackgroundElements:changeBackgroundElements,
        getSNAP:getSNAP,
        getBGPolys:getBGPolys,
        getSnapClip:getSnapClip,
        getVideoPolys:getVideoPolys
    };

})();   