P.Home = (function(){

    var  _currentId,
        _$textSVGModules,
        _$textModules,
        _$textNumbers,
        _introAnimCount = 1,
        _$selector;

    function init(){
        console.log('Home init');
            

        if( _currentId === undefined ) 
            _currentId = 2;

        // Texts
        _$textSVGModules = $('.mainpage-selector-item');
        _$textModules = $('.mainpage-selector-item-link');
        _$textNumbers = $('.mainpage-number');
        _$validateButton = $('.mainpage-validate-button');

        _initEvents();

    }

    function _initEvents(){

        _$validateButton.on('click', function(){
            $('.mainpage-selector-item-link.active').trigger('click');
        });

    }

    function onChooseClick(){

        if( _currentId < 2 ) _currentId ++;
        else                _currentId = 0;

        _$textSVGModules
            .removeClassSVG('active')
            .eq( _currentId )
            .addClassSVG('active');

        _$textModules
            .removeClass('active')
            .eq( _currentId )
            .addClass('active');

        _$textNumbers
            .removeClassSVG('active')
            .eq( _currentId )
            .addClassSVG('active');

        P.BackgroundHome.onChooseClick( _currentId );

    }

    function close(){
        console.log('Home Close');

        _$validateButton.off('click');
    }

    function introAnimationNumbers(){
        
        $('.mainpage-subtitle').addClassSVG('isvisible');
    
        _$textSVGModules.addClassSVG('isvisible');
        $('.mainpage-number').addClassSVG('isvisible');
        $('.mainpage-number.number-03').addClassSVG('active');

        setTimeout(function(){

            _introAnimNumber();

        }, 1800)
    
    };

    function _introAnimNumber(){

        onChooseClick();

        _introAnimCount++;
        if( _introAnimCount < 4 ){
            setTimeout(function(){
                _introAnimNumber();
            }, 1400);
        }else if( _introAnimCount === 4){
            //Everything is done
            P.event_aggregator.trigger( 'onHomeIntroComplete' );
        }

    };

    return{
        init:init,
        introAnimationNumbers:introAnimationNumbers,
        onChooseClick:onChooseClick,
        close:close
    };

})();