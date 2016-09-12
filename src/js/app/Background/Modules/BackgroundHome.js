P.BackgroundHome = (function(){

    var _SNAP,
        _ButtonChoisir,
        _ButtonValidate,
        _ButtonArteLink,
        _ButtonBoutiqueLink,
        _$ButtonChoose,
        _numsSVG = [];

    function init(){        

        console.log('Background Home init');

        _SNAP = P.BackgroundHandler.getSNAP();
        _ButtonChoisir = _SNAP.select('#background path#poly-25');
        _ButtonArteLink = _SNAP.select('#background path#poly-2');
        _ButtonBoutiqueLink = _SNAP.select('#background path#poly-28');

        _$ButtonChoose = $('#svg svg #background #poly-25');
        
        _ButtonValidate = _SNAP.select('.mainpage-validate-button');

        _numsSVG.push(_SNAP.select('.mainpage-number.number-01'));
        _numsSVG.push(_SNAP.select('.mainpage-number.number-02'));
        _numsSVG.push(_SNAP.select('.mainpage-number.number-03'));


        // If first time, we launch the intro and wait until the end
        if( P.Config.isFirstTime === true ){

            P.BackgroundHandler.changeBackgroundElements(0);
            $('.section-footer').attr('data-id', "0");

            // Hide the elements
            $('.mainpage-validate-button, .mainpage-number, .mainpage-subtitle, .mainpage-link-special, .mainpage-link-boutique, .mainpage-choose-button').removeClassSVG('isvisible');

            P.BackgroundIntro.init();

            P.Config.isFirstTime = false;

        }else{
            
            P.BackgroundHandler.changeBackground( 0 );

        }

        // One or another
        P.event_aggregator.bind( 'onHomeIntroComplete', function(){

            _initEvents();        

        });

        P.event_aggregator.bind( 'onchangeBackgroundComplete:0', function(){

            _initEvents();        

        });

        _$ButtonChoose.addClassSVG('ishome');

    }

    //** Initialises events and color selction **/
    function _initEvents(){
        // Show the elements on the page
        $('.mainpage-title, .mainpage-validate-button, .mainpage-number, .mainpage-subtitle, .mainpage-link-special, .mainpage-link-boutique, .mainpage-choose-button').addClassSVG('isvisible');

        _ButtonChoisir.attr('cursor', 'pointer');
        _ButtonArteLink.attr('cursor', 'pointer');
        _ButtonBoutiqueLink.attr('cursor', 'pointer');

        // Events
        _ButtonChoisir.mouseover(function(){
            _ButtonChoisir.animate({opacity: 0}, 100);
            $('.mainpage-choose-button').addClassSVG('ishover');
        })
        .mouseout(function(){
            _ButtonChoisir.animate({opacity: 1}, 300);
            $('.mainpage-choose-button').removeClassSVG('ishover');
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }

            P.Home.onChooseClick();
        });

        _ButtonArteLink.mouseover(function(){
            _ButtonArteLink.animate({opacity: 0.5}, 150);
        })
        .mouseout(function(){
            _ButtonArteLink.animate({opacity: 1}, 300);
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }

            $('.footer-element.elem-2')[0].click();
        });

        _ButtonBoutiqueLink.mouseover(function(){
            _ButtonBoutiqueLink.animate({opacity: 0.5}, 100);
        })
        .mouseout(function(){
            _ButtonBoutiqueLink.animate({opacity: 1}, 300);
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }
            $('.mainpage-link-boutique-link')[0].click();

        });

        _ButtonValidate.mouseover(function(){
            _ButtonValidate.stop().animate( { transform:'s1.3 1.3' }, 200, mina.easeout );
        })
        .mouseout(function(){
            _ButtonValidate.stop().animate( { transform:'s1 1' }, 400, mina.easein );
        })

    }


    function onChooseClick( id ){

        _numsSVG.forEach(function (elem){
            elem.stop();
        });

        _numsSVG[ id ].animate({y:230}, 300);

        // Celui d'avant remonte
        if( ( id - 1 ) >= 0) {
            _numsSVG[ id - 1 ].animate({y:140}, 300);
        }

        if( ( id - 2 ) >= 0 ) {
            _numsSVG[ id - 2 ].attr({y:320});
        }

        if( id === 0 ){
            _numsSVG[ 2 ].animate({y:140}, 300);
        }

        // Celui d'apres se met en-dessous
        if( ( id + 1 ) <= 2 ) {
            _numsSVG[ id + 1 ].attr({y:320});
        }

    }

    function close(){
        console.log('--> Background Home Close');

        _ButtonChoisir.attr('opacity', 1);
        _ButtonChoisir.unmouseover();
        _ButtonChoisir.unmouseout();
        _ButtonChoisir.unmouseup();
        _ButtonChoisir.untouchstart();
        _ButtonChoisir.attr('cursor', 'default');

        _ButtonArteLink.attr('opacity', 1);
        _ButtonArteLink.unmouseover();
        _ButtonArteLink.unmouseout();
        _ButtonArteLink.unmouseup();
        _ButtonArteLink.untouchstart();
        _ButtonArteLink.attr('cursor', 'default');

        _ButtonBoutiqueLink.attr('opacity', 1);
        _ButtonBoutiqueLink.unmouseover();
        _ButtonBoutiqueLink.unmouseout();
        _ButtonBoutiqueLink.unmouseup();
        _ButtonBoutiqueLink.untouchstart();
        _ButtonBoutiqueLink.attr('cursor', 'default');

        _ButtonChoisir = null;
        _ButtonArteLink = null;
        _ButtonBoutiqueLink = null;

        P.event_aggregator.unbind('onHomeIntroComplete' );
        P.event_aggregator.unbind('onchangeBackgroundComplete:0' );

        _$ButtonChoose.removeClassSVG('ishome');

    }

    return{
        init:init,
        onChooseClick:onChooseClick,
        close:close
    };

})();