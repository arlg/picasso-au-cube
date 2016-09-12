P.BackgroundCommon = (function(){

    /***
        Handles global common events on pages
    ****/

    var _SNAPBG,

        _backHomePoly,
        _backHomePolySec,
        _seeMorePoly,
        _seeMoreLayer,
        _layerInfo,

        _$infoText,
        _$moreInfoInside,
        _$moreinfoImages,
        _ButtonCloseMore;

    function init(){

        _SNAPBG = P.BackgroundHandler.getSNAP();

        _backHomePoly = _SNAPBG.select('#background #poly-13');
        _seeMorePoly = _SNAPBG.select('#background #poly-29');

        _ButtonCloseMore = $('.close-info-layer');
        _$infoText = $('.svgelement.info-left');
        _$moreInfoInside = $('.mod-main-module .moreinfo-layer');
        _$moreinfoImages = $('.info-layer-module-image.module3');

        //Layer Info
        _layerInfo = _SNAPBG.select('#info-layer');

        _initEvents();


    }

    function _initEvents(){

        P.event_aggregator.bind( 'onchangeBackgroundCompleteCommon', function(){
    
            _onPageChanged();

        } );
    }

    function _onPageChanged(){

        // Remove all previously attributed elements
        close();

        // Checks in the new page if something has to be binded

        // BACK HOME
        if( $('.mod-main-module.active').length ){
            _initBackHome();
        }


        // SEE MORE
        if( $('.svgelement.info-left.isactivable.isvisible').length ){

            _initSeeMore();

        }

    }
    function _initBackHome(){
        _backHomePoly.attr('cursor', 'pointer');

        _backHomePoly.mouseover(function(e){
            _backHomePoly.animate({opacity:0}, 100);
        })
        .mouseout(function(){
            _backHomePoly.animate({opacity:1}, 300);
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }
            
            $('.mod-main-module.active').find('.home-link').trigger('click');

             // Xiti
            var tag = '';
            if(  P.Config.currentId === 1 ){
                tag = 'picasso_au_cube::si_picasso_etait::picasso3';
            }else if(  P.Config.currentId === 2 ){
                tag = 'picasso_au_cube::si_picasso_me_dessinait::picasso3';
            }else{
                tag = 'picasso_au_cube::si_picasso_m_etait_reinvente::picasso3';
            }

            xt_med('C',xtn2Value,tag,'A');


        });
        
        
    }

    function _initSeeMore(){
            
        _seeMorePoly.attr('cursor', 'pointer');

        _seeMorePoly
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }

            _onSeeMoreOpen();
        });

        _ButtonCloseMore.on('click', function(){
            _onSeeMoreClose();
        });

    }

    function _onSeeMoreOpen(){
        
        _$infoText.addClassSVG('inactive');
        _layerInfo.attr('display', 'block');

        // Switching content
        $('.info-layer-content').removeClassSVG('active');
        $('.info-layer-content.module' + P.Config.currentId ).addClassSVG('active');

        // Module 3 images
        if( P.Config.currentId === 3 ){

            _$moreinfoImages
                .removeClassSVG('active')
                .eq( P.VideoModule.getCurrentId() ).addClassSVG('active');

            $('.section-main-03 .text-under[data-id="'+P.VideoModule.getCurrentId()+'"]').addClass('active');

            // Pause video
            P.YoutubeVideo.pauseVideo();
            
        }

        _$moreInfoInside.addClass('active');
        $('.mod-video').addClass('behind');
        
        P.event_aggregator.trigger( 'onSeeMoreOpen' );

        // Xiti
        var tag = '';
        if(  P.Config.currentId === 2 ){
            tag = 'picasso_au_cube::si_picasso_me_dessinait::popup';
        }else{
            tag = 'picasso_au_cube::si_picasso_m_etait_reinvente::popup';
        }

        xt_med('C',xtn2Value,tag,'A');

    }

    function _onSeeMoreClose(){

        _$infoText.removeClassSVG('inactive');

        $('.info-layer-content').removeClassSVG('active');
        _$moreinfoImages.removeClassSVG('active');
        $('.section-main-03 .text-under').removeClass('active');

        _layerInfo.attr('display', 'none');
        _$moreInfoInside.removeClass('active');

        $('.mod-video').removeClass('behind');

        P.event_aggregator.trigger( 'onSeeMoreClose' );

    }

    function close(){

        console.log('close backgroundcommon');

        _onSeeMoreClose();

        // BACK HOME
        _backHomePoly.attr('cursor', 'default');
        _backHomePoly.attr('opacity', 1);
        
        _backHomePoly.unmouseover();
        _backHomePoly.unmouseout();
        _backHomePoly.unmouseup();

        // SEE MORE
        _seeMorePoly.unmouseup();

        _ButtonCloseMore.off('click');
        _seeMorePoly.attr('cursor', 'default');

    }

    return{
        init:init,
        close:close
    };

})();