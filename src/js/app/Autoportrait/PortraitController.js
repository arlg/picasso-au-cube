var P = P ||{};

// Controller for autoportrait -- Handles main changes
P.PortraitController = (function(){
    "use strict";

    var _currentStep = null,
        _currentStepSVG = null,
        _$steps,

        // Buttons triggers
        _$webcamButton,
        _$photoButton,
        _$fbButton,
        _$validateButton,
        _$homeImage,
        _$gallery,

        _$galleryFBWrapper,

        _$buttonRestart,

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

        _$webcamButton = $('.auto-button.button-webcam');
        _$photoButton = $('.auto-button.button-photo');
        _$fbButton = $('.auto-button.button-facebook');

        _$homeImage = $('#svg #autoportrait .home-image');

        _$gallery = $('.mod-auto-gallery');
        _$buttonRestart = $('#svg #autoportrait .button-end-retry');

        _$galleryFBWrapper = $('.mod-auto-step.step-facebook-01 .mod-auto-left');

        // Closes
        _$close = $('svg .close-auto');
        _$closeGallery = $('svg .close-gallery');

        _currentStep = $('.mod-auto-step.step-home');
        _currentStepSVG = $('#svg #autoportrait .step-home');

        changeStep('start');

        _initEvents();

        _testBrowserSupport();

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

        _currentStepSVG.removeClassSVG('active');

        _$close.addClassSVG('active');

        if( currentState === 'facechange' ){

            _currentStep = $('.mod-auto-step.step-facechange');
            _currentStepSVG  = $('#svg #autoportrait .step-facechange');

        }else if( currentState === 'picture' ){
            _currentStep = $('.mod-auto-step.step-picture');

        }else if( currentState === 'facebook-01' ){
            _currentStep = $('.mod-auto-step.step-facebook-01');

        }else if( currentState === 'end' ){

            _currentStep = $('.mod-auto-step.step-end');

            _currentStepSVG  = $('#svg #autoportrait .step-end ');


        }else if( currentState === 'start' ){

            _currentStep = $('.mod-auto-step.step-home');

            _currentStepSVG  = $('#svg #autoportrait .step-home');

            _$close.removeClassSVG('active');
        }

        _currentStep.addClass('active');

        _currentStepSVG.addClassSVG('active');

        if( currentState ===  'facebook-01' || currentState ===  'picture' ){
            _$homeImage.removeClassSVG('active');
        }

    }

    function _initEvents(){

        $('.auto-button').on('click', function(){
            $('.auto-button').removeClassSVG('current');
            $(this).addClassSVG('current');
        });
        
        _$webcamButton.on('click', function(){
            changeStep( 'facechange' );
            P.Portrait.init('webcam');
            $('.info-webcam').addClass('active');
        });

        _$photoButton.on('click', function(){
            changeStep( 'picture' );
            P.Portrait.init('picture');
            $('.info-webcam').removeClass('active');
        });

        _$fbButton.on('click', function(){

            P.PortraitFacebook.login( 
                function( _state ){
                    _createFBGalleryStep1( _state );
                }
            )

            $('.info-webcam').removeClass('active');

        });

        ///// CLOSES
        _$close.on('click', function(){ 
                
            close();
            init();

        });

        _$closeGallery.on('click', function(){ 
                
            if(  _isGallery === true  ){
                _closeGallery();
            }

        });


        // RESTART
        _$buttonRestart.on('click', function(){

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
			
		domWrapper.addClass('wrapper');

        _$galleryFBWrapper.find('div').unbind().remove();

        for (var j = picturesLength - 1; j >= 0; j--) {

            var photWrap = $( document.createElement('div') ),
                pic = $( document.createElement('img') );
				
				photWrap.attr('class', 'facebookphoto');
			
                pic.attr({
                    'src': _pictures[j]
                });
            
            photWrap.append( pic );
                
            domWrapper.append(photWrap);

            _$galleryFBWrapper.append(domWrapper);
        }
		
		$('.mod-auto-step.step-facebook-01 .mod-auto-left').mCustomScrollbar();

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
              P.Portrait.setFacebookPicture( $('.facebookphoto.active img').attr('src') );
              
        });

    }

    function showGallery(){

        $('#svg svg #autoportrait .step-gallery.auto-title').addClassSVG('active');

        _currentStepSVG.removeClassSVG('active');
        _currentStep.removeClass('active');
        

        _$gallery.addClass('active');
        _$closeGallery.addClassSVG('active');
        _isGallery = true;

        xt_med('C',xtn2Value,'picasso_au_cube::si_picasso_me_dessinait::la_galerie_complete','N');

    }

    function _closeGallery(){
        $('#svg svg #autoportrait .step-gallery.auto-title').removeClassSVG('active');

        _currentStepSVG.addClassSVG('active');
        _currentStep.addClass('active');

        _$gallery.removeClass('active');
        _$closeGallery.removeClassSVG('active');
        _isGallery = false;
    }

    function close(){

        console.log('- PortraiController Close');

        _closeGallery();
        changeStep('start');

        $('#svg #autoportrait .auto-step').removeClassSVG('active');

        _$webcamButton.off('click');
        _$photoButton.off('click');
        
        _$closeGallery.off('click');
        _$close.off('click');
        _$buttonRestart.off('click');
        _$fbButton.off('click');
        _$photoButton.off('click');
        _$webcamButton.off('click');
        $('.auto-button').off('click');

        _$close.removeClassSVG('active');
        
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