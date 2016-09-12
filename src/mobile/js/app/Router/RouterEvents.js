P.RouterEvents = (function(){
    
    function init(){

        _appLinkRouter();

    }

    // Routes links to the router, giving the arguments
    function _appLinkRouter(){
        $( document ).hammer().on('tap', 'a[href^="/"]', function(event) {

            var href, passThrough, url;
            href = $(event.currentTarget).attr('href');
            // passThrough = href.indexOf('sign_out') >= 0;
            if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
                event.preventDefault();
                url = href.replace('/', '');

                url = lang + '/' + url;

                P.AppRouter.navigate(url, {
                    trigger: true
                });
                
                return false;
            }
        });
    }

    return {
        init : init
    };

})();