// Main Controller for the Section 2  : Autoportrait
P.PortraitFacebook = (function(){

    var _$fbConnectButton,

        _isConnected,

        _userAlbums,
        _userPictures = [];

    function init(){

        _isConnected = false;
        _isParseAlbumsDone = false;
        _isParsePicsDone = false;

        _$fbConnectButton = $('.mod-auto-button-facebook');

        _$fbConnectButton.removeClass('inactive');

        _fbConnectHandler();

    }

    function login( callback ){
        
        // Connect on click on the facebook button
        FB.login(function(response) {

              if (response.authResponse) {
                  
                  console.log('->Welcome!  Fetching your information.... ');
                  callback( true );

              } else {

                 console.log('User cancelled login or did not fully authorize.');
                 callback( false );

              }
          }, {scope:'user_photos, publish_stream, publish_actions'}

        );

    }

    function _fbConnectHandler(){
          
          /* Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired for any authentication related change, such as login, logout or session refresh. This means that whenever someone who was previously logged out tries to log in again, the correct case below will be handled. */
          FB.Event.subscribe('auth.authResponseChange', function(response) {

              if (response.status === 'connected') {
                  // The pêrson is logged
                  console.log('User already connected');
                    
                    _isConnected = true;

                    _onFBUserConnected();

              } else if (response.status === 'not_authorized') {
                  console.log('not_authorize');
                  _login();
              } else {
                
                  // Not logged into Facebook, so we prompt to
                  _login();
              }
          });
    }

    function _onFBUserConnected(){
        
    }

    function _createGallery( albums ){

        
    }

    function getUserPictures( callback ){

        if(  P.PortraitFacebook.getPicturesArray().length > 0 ) {
            callback();
            return;
        }

        var albumCount = 0;

        FB.api('/me/albums', function(response){

            if (!response || response.error) {
                alert(P.DataHandler.data.autoportrait.facebook_error);
				
				P.PortraitController.changeStep('start');
				
            } else {
                
                _userAlbums = response.data;

                for (var i = 0; i < _userAlbums.length; i++) {

                    FB.api( _userAlbums[i].id+'/photos', function( response ){

                        for (var j = 0; j < response.data.length; j++) {
                            P.PortraitFacebook.setPicturesArray( response.data[j].source );
                        }

                        albumCount++;

                        if( albumCount === _userAlbums.length ){
                            callback();
                        }

                    });
                }
            }
           
        });
    }
    function sharePicture( source ){

      FB.api('/me/photos', 'post', {
            message: P.DataHandler.data.social.facebook_autoportrait.title + " - " + P.DataHandler.data.social.facebook_autoportrait.description + ' - '+ document.URL,
            url:source        
        }, function(response){

            if (!response || response.error) {
                // alert('Error occured');
                console.log(response);
            } else {
                // alert('Post ID: ' + response.id);
                alert(P.DataHandler.data.autoportrait.success_facebook);
            }

      });// Photo

    }

    function close(){

          

    }

    function setPicturesArray( el ){
        
        _userPictures.push( el );

    }

    function getPicturesArray( ){
        
        return _userPictures;

    }

    return{
        init:init,
        login:login,
        getUserPictures:getUserPictures,
        setPicturesArray:setPicturesArray,
        getPicturesArray:getPicturesArray,
        sharePicture:sharePicture,
        close:close

    };

})();