var P = P ||{};

// Controller for autoportrait -- Handles main changes
P.PortraitController = (function(){
    "use strict";

    var _currentStep = null,
        _$steps,

        // Buttons triggers
        _$photoButton,
        _$fbButton,
        _$validateButton,
        _$homeImage,
        _$gallery,

        _$galleryFBWrapper,

        _$buttonRestart,
        _$buttonOpenGallery,

        // Closes
        _$close,
        _$closeGallery,

        // End buttons
        _$buttonSave,
        _$buttonSaveGallery,

        _isGallery = false;


    function init(){
        console.log('Init Portrait');
        
        P.PortraitImage.init();

        // Vars
        
        _$steps = $('.mod-auto-step'); // HTML

        _$photoButton = $('.auto-button.button-photo');
        _$fbButton = $('.auto-button.button-facebook');

        _$homeImage = $('.mod-auto-step.step-home .left-side img');

        _$gallery = $('.mod-auto-gallery');
        _$buttonRestart = $('.auto-button.button-end-retry');

        _$galleryFBWrapper = $('.mod-auto-step.step-facebook-01 .mod-auto-left');

        // Closes
        _$close = $('.close-auto');
        _$closeGallery = $('.close-gallery');

        _currentStep = $('.mod-auto-step.step-home');

        _$buttonOpenGallery = $('.auto-button.step-home.button-opengallery');

        changeStep('start');

        _initEvents();

        _testBrowserSupport();

        $('.gallery-container').mCustomScrollbar();

    }

    function _testBrowserSupport(){

        // IE9
        if( window.FileReader === undefined ){
            
            _$photoButton.addClassSVG('inactive');

            $('.mod-auto-step.step-picture .input-field').hide();
            $('.mod-auto-step.step-picture .notsupported').addClass('active');

        }

    }

    // Click on one of the 3 choices
    function changeStep( _currentState ){
        
        console.log('- changeStep ->  ' + _currentState);

        var currentState = _currentState;

        _currentStep.removeClass('active');

        _$close.addClassSVG('active');

        if( currentState === 'facechange' ){

            _currentStep = $('.mod-auto-step.step-facechange');

        }else if( currentState === 'picture' ){
            _currentStep = $('.mod-auto-step.step-picture');

        }else if( currentState === 'facebook-01' ){
            _currentStep = $('.mod-auto-step.step-facebook-01');

        }else if( currentState === 'end' ){

            _currentStep = $('.mod-auto-step.step-end');


        }else if( currentState === 'start' ){

            _currentStep = $('.mod-auto-step.step-home');

            _$close.removeClassSVG('active');
        }

        _currentStep.addClass('active');

        if( currentState ===  'facebook-01' || currentState ===  'picture' ){
            _$homeImage.removeClass('active');
        }

    }

    function _initEvents(){

        $('.auto-button').hammer({tapMaxTime:300}).on('tap', function(){
            $('.auto-button').removeClassSVG('current');
            $(this).addClass('current');
        });

        _$photoButton.hammer({tapMaxTime:300}).on('tap', function(){
            changeStep( 'picture' );
            P.Portrait.init('picture');
            $('.info-webcam').removeClass('active');
        });

        _$fbButton.hammer({tapMaxTime:300}).on('tap', function(){

            P.PortraitFacebook.login( 
                function( _state ){
                    _createFBGalleryStep1( _state );
                }
            )

            $('.info-webcam').removeClass('active');

        });

        _$buttonOpenGallery.hammer({tapMaxTime:300}).on('tap', function(){

            showGallery();

        });

        ///// CLOSES
        _$close.hammer({tapMaxTime:300}).on('tap', function(){ 
                
            close();
            init();

        });

        _$closeGallery.hammer({tapMaxTime:300}).on('tap', function(){ 
                
            if(  _isGallery === true  ){
                _closeGallery();
            }

        });


        // RESTART
        _$buttonRestart.hammer({tapMaxTime:300}).on('tap', function(){

            changeStep('start');
            resume();

        });

        
    }

    /**
        _state = true si Facebook connecté
        false si erreur
    **/
    function _createFBGalleryStep1( _state ){

        changeStep('facebook-01');

        // We're good to go to step 2
                
        P.PortraitFacebook.getUserPictures(function(){

            _createFBGalleryStep2( P.PortraitFacebook.getPicturesArray() );

        });
        

    }

    function _createFBGalleryStep2( _pictures ){

        var picturesLength = _pictures.length,
            domWrapper = $(document.createElement('div'));

        _$galleryFBWrapper.find('div').unbind().remove();

        for (var j = picturesLength - 1; j >= 0; j--) {

            var photWrap = $( document.createElement('div') ),
                pic = $( document.createElement('img') );

                pic.attr({
                    'src': _pictures[j],
                    'class' : 'facebookphoto'
                });
            
            photWrap.append( pic );
                
            domWrapper.append(photWrap);

            _$galleryFBWrapper.append(domWrapper);
        }

        _prepareGallerySelection();
    }

    function _prepareGallerySelection(){

        $(document).off('click','.facebookphoto');
        $('.mod-auto-step.step-facebook-01 .mod-auto-button-valid-gallery').off('click');

        $(document).on('click','.facebookphoto', function(){

            $('.facebookphoto').removeClass('active');
            $(this).addClass('active');

        });
    
        // Validate button
        $('.mod-auto-step.step-facebook-01 .mod-auto-button-valid-gallery').on('click', function(){
              
              P.Portrait.init( 'facebook' );
              P.Portrait.setFacebookPicture( $('.facebookphoto.active').attr('src') );
              
        });

    }

    function showGallery(){

        $('#svg svg #autoportrait .step-gallery.auto-title').addClassSVG('active');

        _currentStep.removeClass('active');

        _$gallery.addClass('active');
        _$closeGallery.addClassSVG('active');
        _isGallery = true;

        xt_med('C',xtn2Value,'picasso_au_cube::si_picasso_me_dessinait::la_galerie_complete_mobile','N');

    }

    function _closeGallery(){
        $('#svg svg #autoportrait .step-gallery.auto-title').removeClassSVG('active');

        _currentStep.addClass('active');

        _$gallery.removeClass('active');
        _$closeGallery.removeClassSVG('active');
        _isGallery = false;
    }

    function close(){

        console.log('- PortraitController Close');

        _closeGallery();
        changeStep('start');

        _$photoButton.hammer().off('tap');
        
        _$closeGallery.hammer().off('tap');
        _$close.hammer().off('tap');
        _$buttonRestart.hammer().off('tap');
        _$fbButton.hammer().off('tap');
        _$photoButton.hammer().off('tap');
        $('.auto-button').hammer().off('tap');
        
        stopApp();

        P.PortraitImage.close();
    }


    /***
        RESTART EVERYTHING
    ***/

    function stopApp(){

        P.Portrait.close();

    }
    function resume(){
        stopApp();

        close();

        init();

    }

    return{
        init:init,
        close:close,
        changeStep:changeStep,
        showGallery:showGallery,
        stopApp:stopApp
    };

})();