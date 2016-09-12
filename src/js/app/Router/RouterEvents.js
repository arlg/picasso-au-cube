P.RouterEvents = (function(){
    
    function init(){

        _appLinkRouter();

    }

    // Routes links to the router, giving the arguments
    function _appLinkRouter(){
        $( document ).on('click', 'a[href^="/"]', function(event) {

            var href, passThrough, url;
            href = $(event.currentTarget).attr('href');
            // passThrough = href.indexOf('sign_out') >= 0;
            if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
                event.preventDefault();
                url = href.replace('/', '');

                url = lang + '/' + url;

                if(P.FullscreenHandler.getIsFullscreen() === false){
                    P.AppRouter.navigate(url, {
                        trigger: true
                    });
                }else{
                    P.Presenter.prototype.call( url );
                }
                
                return false;
            }
        });
    }

    return {
        init : init
    };

})();