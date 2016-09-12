P.BackgroundIntro = (function(){
    var
        _BGArea1,
        _BGArea2,
        _BGArea3,
        _BGArea4,
        _BGpaths,
        _BGpathsOutside,
        _BGCenterpaths,
        _animation2Timeout,
        _polyanimTimeout,
        _allBGAnimationOrder = [],
        _SNAP;


    function init(){

        _SNAP = P.BackgroundHandler.getSNAP();

        _BGpaths = _SNAP.selectAll("#background #inside path");
        _BGpathsOutside = _SNAP.selectAll("#background #outside path");

        // Animation at the beginning
        _BGCenterpaths = _SNAP.selectAll('#background #poly-33,#background #poly-34,#background #poly-45');

        _BGArea1 = _SNAP.selectAll(
           '#background #poly-20,#background #poly-22,#background #poly-23,#background #poly-58,#background #poly-32'
        );

        _BGArea2 = _SNAP.selectAll(
           '#background #poly-46,#background #poly-43,#background #poly-19,           #background #poly-47,#background #poly-56,#background #poly-42,#background #poly-7,#background #poly-42'
        );

        _BGArea3 = _SNAP.selectAll(
           '#background #poly-25,#background #poly-38,#background #poly-51,           #background #poly-36,#background #poly-48,#background #poly-56,#background #poly-41,#background #poly-19, #background #poly-39, #background #poly-53'
        );

        _BGArea4 = _SNAP.selectAll(
           '#background #poly-29,#background #poly-18,#background #poly-3,           #background #poly-50,#background #poly-63,#background #poly-11,#background #poly-12,#background #poly-14'
        );

        
        _allBGAnimationOrder.push(_BGArea1);
        _allBGAnimationOrder.push(_BGArea2);
        _allBGAnimationOrder.push(_BGArea3);
        _allBGAnimationOrder.push(_BGArea4);

        _animateWebsiteIntro();
        
    }

    function _animateWebsiteIntro(){

        var reversedColorsArray = P.BackgroundData.states[0].reverse(),
            color = '';

        // Fill color the inside Polys
        for (var i = _BGpaths.length - 1; i >= 0; i--) {
            
            color = reversedColorsArray[i];
                
            _BGpaths[i].attr({'opacity': 0}).attr({fill: color});

        };

        // Fill color the outside Polys
        for (var y = _BGpathsOutside.length - 1;  y >= 0;  y--) {

            color = reversedColorsArray[y];
            _BGpathsOutside[y].attr({'opacity': 0}).attr({fill: color});

        }


        // Center
        _BGCenterpaths.forEach( function(elem,i) {

            elem.animate({'opacity': 1},  500, mina.easeIn);

        });

        _animation2Timeout = setTimeout(function(){
            _animateWebsiteIntro2();
        }, 1200);
        

        // Change the flag
        P.Presenter.hasSeenIntro = true;

    }

    function _animateWebsiteIntro2(){

        clearTimeout( _animation2Timeout );

        for (var i = 0; i < _allBGAnimationOrder.length; i++) {
            
            for (var y = 0; y < _allBGAnimationOrder[i].length; y++) {
                
                var delay = ( i + 1 ) * ( y * 40);

                _opacityAnimation( _allBGAnimationOrder[i][y], delay );
            };

            
            if( (i+1) === _allBGAnimationOrder.length && y === _allBGAnimationOrder[i].length ){
                
                setTimeout( function(){
                    _onWebsiteIntroDone();
                }, delay );

            }
            
        }

        
    }

    function _opacityAnimation( elem, delay ){

        _polyanimTimeout = setTimeout(function(){
            elem.attr( {'opacity': 1} );
        }, delay)

    }

    function _onWebsiteIntroDone(){

        clearTimeout( _onWebsiteIntroDone );

        _BGpaths.forEach( function(elem,i) {

            elem.animate({opacity: 1}, 500, mina.easeIn);

        });

        // Fill opacity the outside Polys
        for (var y = _BGpathsOutside.length - 1;  y >= 0;  y--) {

            _BGpathsOutside[y].animate({opacity: 1}, 500, mina.easeIn);

        }

        P.Home.introAnimationNumbers();

    }


    return{
        init:init
    };

})();