P.FullscreenHandler = (function(){

    var _isFullscreen;

    function init(){

        _isFullscreen = false;
        
        $('.footer-element-fs').on('click', function(){
            
            if( _isFullscreen === false ){
                _isFullscreen = true;
                _launchFullScreen(document.documentElement);
            }
            else{
                _isFullscreen = false;
                _removeFullScreen();
            }
        });

    }

    function _launchFullScreen( element ){
        if(element.requestFullscreen) {
            element.requestFullscreen();
          } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
          } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
          } else if(element.msRequestFullscreen) {
            element.msRequestFullscreen();
          }

          $('#arte-header').hide();
          $('.content-wrapper').addClass('isfullscreen');
          
    }

    function _removeFullScreen(){
        
         if(document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if(document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }

        $('#arte-header').show();
        $('.content-wrapper').removeClass('isfullscreen');

    }

    function getIsFullscreen(){
        return _isFullscreen;
    }

    return{
        init:init,
        getIsFullscreen:getIsFullscreen
    };

})();