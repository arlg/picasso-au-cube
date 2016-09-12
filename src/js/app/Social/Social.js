function get_short_url(long_url, func)
{   
    $.getJSON(
        "https://api-ssl.bitly.com/v3/shorten?callback=?",
        {
            "format": "json",
            "apiKey": "R_688a0439e2463ef84d344f599caa208b",
            "login": "arlg",
            "longUrl": long_url
        },
        function(response)
        {
            func( response.data.url );
        }
    );
}

P.Social = (function(){

    var _$footerFB,
        _$footerTW,
        _$footerG;

    function init(){

        _$footerFB = $('.footer-element-social.elem-6 a');
        _$footerTW = $('.footer-element-social.elem-7 a');
        _$footerG = $('.footer-element-social.elem-8 a');

        $.ajaxSetup({ cache: true });
        $.getScript('//connect.facebook.net/fr_FR/all.js', function(){
            
            FB.init({
                appId      : '263786353803104',
                status     : true, // check login status
                cookie     : true, // enable cookies to allow the server to access the session
                xfbml      : true  // parse XFBML
            });

        });

        _initEvents();
    }

    function _initEvents(){

        // _$footerFB.on('click', function(){
        //     _onFBShare();
        // });

    }

    function _onFBShare( id ){
        
        var objname = {};
        var someObject = "facebook_" + id;

        var fbDatas = [
            encodeURIComponent( document.URL ),
            encodeURIComponent( window.location.origin + '/img/share.jpg' ),
            encodeURIComponent( P.DataHandler.data.social[someObject].title ), // Taken on the page's opengraphs
            encodeURIComponent( P.DataHandler.data.social[someObject].description )
        ];

        var fbLink = 'http://www.facebook.com/sharer.php?s=100&p[url]=' + fbDatas[0] + '&p[images][0]=' + fbDatas[1] + '&p[title]=' + fbDatas[2] + '&p[summary]=' +fbDatas[3];

        _$footerFB.attr('href', fbLink);
    }

    function _onTWShare( id ){

         get_short_url(document.URL, function(short_url) {

            var objname = {};
            var someObject = "twitter_" + id;

            var twDatas =[
                encodeURIComponent( short_url ),
                encodeURIComponent(P.DataHandler.data.social[someObject])
            ];

            var twLink = 'https://twitter.com/intent/tweet?text='+ twDatas[1] +'&url='+ twDatas[0];

            _$footerTW.attr('href', twLink);

        });


    }

    function shareImageTwitter( source ){

        // GET URL OF THE PICTURE
        get_short_url(source, function( image_url ){

            get_short_url(document.URL, function( source ) {

                var twDatas =[
                    encodeURIComponent( source ),
                    encodeURIComponent(P.DataHandler.data.social.twitter_autoportrait + ' - ' + image_url)
                ];

                var twLink = 'https://twitter.com/intent/tweet?text='+ twDatas[1] +'&url='+ twDatas[0];

                window.open(twLink);

            });

        })
    }

    function _onGShare( id ){

        var gLink = "https://plus.google.com/share?url=" + encodeURIComponent( document.URL );

        _$footerG.attr('href', gLink);

    }

    function refreshLinks( id ){

        if( P.DataHandler.isLoaded === true ){
                    _onFBShare( id );
                    _onTWShare( id );
                    _onGShare( id );
        }else{
            setTimeout(function(){
                refreshLinks(id)
            }, 500);
        }
    }

    return{
        init:init,
        shareImageTwitter:shareImageTwitter,
        refreshLinks:refreshLinks
    }
})();