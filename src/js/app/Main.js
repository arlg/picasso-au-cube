/***********************
    @author Aurelien G.
    http://www.arlg.me 
***********************/

var P = P ||{};

$(function () {});

$(window).load(function(){
    P.App.init();
});

P.App = (function(){

    function init(){

        _initEvents();

        detectDevice();

        P.DataHandler.init();

        P.BackgroundHandler.init();

        P.RouterEvents.init();

        P.Resizer.init();
        
        P.VideoWrapper.init();

        P.YoutubeVideo.init();
        
        P.Social.init();

        P.Footer.init();

        P.Storage.init();

        P.AppRouter = new P.Router();

        Backbone.history.start({ pushState: 'pushState' in window.history });
        // Backbone.history.start({ pushState: 'pushState' in window.history , root: '/picasso/build/'});
        // Backbone.history.start({ pushState: 'pushState' in window.history, root: '/_GUEST/picasso/' });
    }

    function detectDevice(){

        P.Config.isTouchDevice = navigator.userAgent.match(/iPad/i) != null;
        
        if ( P.Config.isTouchDevice === true ){
            $('svg').removeAttr('preserveAspectRatio');
        }

    }

    function _initEvents(){

        //Adds an event aggregator
        P.event_aggregator = _.extend({}, Backbone.Events);

    }

    return {
        init : init
    };

})();