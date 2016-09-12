/***********************
    @author Aurelien G.
    Mobile version
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

        P.DataHandler.init();
        
        P.VideoWrapper.init();

        P.YoutubeVideo.init();
        
        P.RouterEvents.init();
        
        P.Social.init();

        P.Storage.init();
        P.Resizer.init();
        P.Footer.init();

        P.Menus.init();

        P.AppRouter = new P.Router();

        // PICASSO.DEV
        Backbone.history.start({ pushState: 'pushState' in window.history, root: '/mobile' });

        // IP Local
        // Backbone.history.start({ pushState: 'pushState' in window.history, root: 'picasso/build/mobile' });

        // PREPROD
        // Backbone.history.start({ pushState: 'pushState' in window.history, root: '/_GUEST/picasso/mobile' });

        // IOS 7 CRAP
        $(window).on('orientationchange', function () {
            window.scrollTo(0, 0);
        });

        $(window).on('scroll', function () {
          var focusedElement;

          if ($(document).scrollTop() !== 0) {
            focusedElement = $(':focus');
            if (!(focusedElement.is('input') || focusedElement.is('textarea'))) window.scrollTo(0, 0);
          }
        });

    }

    function _initEvents(){

        //Adds an event aggregator
        P.event_aggregator = _.extend({}, Backbone.Events);

    }

    return {
        init : init
    };

})();