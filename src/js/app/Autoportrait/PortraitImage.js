
/**
    Handles Main image and User - interaction Events
**/
P.PortraitImage = (function(){

    var
        _$validateButton,
        _$buttonSave,
        _$buttonSaveGallery,

        // Social Buttons
        _$autoShareFB,
        _$autoShareTW,
        _$autoShareGP,

        // Final Image
        _finalImageData,
        _imageName,
        _imageUrl,

        // Flags

        _hasPublishedToGallery = false;

    function init(){
        console.log('PortraitImage init');

        _hasPublishedToGallery = false;

        _$validateButton = $('#svg svg .button-facechange-validate');
        _$buttonSave = $('#svg svg .button-save');
        _$buttonSaveGallery = $('#svg svg .button-addgallery');
        
         // Social
        _$autoShareFB = $('#svg svg .button-share-facebook');
        _$autoShareTW = $('#svg svg .button-share-twitter');
        _$autoShareGP = $('#svg svg .button-share-google');

        _initEvents();

    }

    function _initEvents(){

        _$validateButton.on('click', function(){
            
            _onValidateImage();

        });


        _$buttonSave.on('click', function(){
            console.log('-- ');
            _saveToUserComputer(); 

        });

        _$buttonSaveGallery.on('click', function(){

            _publishToGallery();

        });

        // SHARE
        // SOCIAL
        _$autoShareFB.on('click', function(){ _onShareFB(); });
        _$autoShareTW.on('click', function(){ _onShareTW(); });

    }

    function _onValidateImage(){

        _finalImageData = P.Portrait.takePicture();
        P.PortraitController.changeStep( 'end' );

        $( '.mod-auto-step-end-image' ).attr( 'src', _finalImageData );

        _imageName = GetDate();
        _imageUrl = base + 'img/userportraits/'+ _imageName + '.png';

        $.ajax({
            type: "POST",
            url: base+'php/imagesaveserver.php',
            data: { image: _finalImageData, name: _imageName },
            success: function(e){
                if( e === '0' ){
                    console.log('Image sauvegardée');
                }else{
                    console.log(e);
                }
            },
            error: function(r){
                console.log(r);
            }
        });

        P.PortraitController.stopApp();

    }

    function _saveToUserComputer(){
        var Cs = new CanvasSaver(base+'php/imagesaver.php');
        Cs.save( 'saveanimage',  _finalImageData, 'sipicassomedessinait');
    }

    function _publishToGallery(){

        if( _hasPublishedToGallery === false  ){
            $('.gallery-container').append('<div class="gallery-item"><img src="'+_imageUrl+'" alt=""></div>');
            alert(P.DataHandler.data.autoportrait.add_gallery_success);
            _hasPublishedToGallery = true;
        }else{
            alert(P.DataHandler.data.autoportrait.add_gallery_error);
        }

    }

    function _onShareFB(){

        P.PortraitFacebook.login( function(){

            P.PortraitFacebook.sharePicture( _imageUrl );

        } );

    }

    function _onShareTW(){

        P.Social.shareImageTwitter( _imageUrl );

    }

    function close(){

        console.log('Close PortraitImage');
        _hasPublishedToGallery = false;
        _$buttonSave.off('click');
        _$buttonSaveGallery.off('click');
        _$validateButton.off('click');

        _$autoShareFB.off('click', function(){ _onShareFB(); });
        _$autoShareTW.off('click', function(){ _onShareTW(); });

        _finalImageData = '';

    }

    return{
        init:init,
        close:close
    }

})()