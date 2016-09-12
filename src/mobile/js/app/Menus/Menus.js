P.Menus = (function(){

    var _$menuleft,
        _$menuleftbutton,
        _$menuright,
        _$menurightLink,
        _$moreinfointro,
        _$moreInfoClose,
        _$moreinfoImages,
        _$overlay,
        _isMenuLeftOpen;

    function init(){
        _isMenuLeftOpen = false;
        _$menuleft = $('.menumain.menuleft');
        _$menuleftbutton = $('.menu-button.menu-left-button');

        _$menuright =  $('.menuright-wrapper .number');
        _$menurightLink = $('.menuright-wrapper a');

        _$moreinfointro = $('.more-info-intro');
        _$moreInfoClose = $('.moreinfo-layer .close');

        _$moreinfoImages = $('.section-main-03 .moreinfo-layer img');

        _$overlay = $('.section-footer-overlay');

        $('.moreinfo-layer .content').mCustomScrollbar();

        _initEvents();
    }


    function _initEvents(){

        _$menuleftbutton.hammer({tapMaxTime:300}).on('tap', function(){

            _onMenuleftClick();

        });

        _$menuright.hammer({tapMaxTime:300}).on('tap', function(){

            _onMenuRightItemClick( $(this) );

        });

        _$menurightLink.hammer({tapMaxTime:300}).on('tap', function(){

            _$menuright.parent().removeClass('active');

        });


        _$moreinfointro.hammer({tapMaxTime:300}).on('tap', function(){

            _onMoreInfoClickOpen();

        });

        _$moreInfoClose.hammer({tapMaxTime:300}).on('tap', function(){

            _onMoreInfoClickClose();

        });

    }

    function _onMoreInfoClickOpen(){

        $('.section-main.active').find('.moreinfo-layer').addClass('active');

        // Module 3 images
        if( P.Config.currentId === 3 ){
            
            _$moreinfoImages
                .removeClass('active')
                .eq( P.VideoModule.getCurrentId() ).addClass('active');

            $('.section-main-03 .text-under[data-id="'+P.VideoModule.getCurrentId()+'"]').addClass('active');

            // Pause video
            P.YoutubeVideo.pauseVideo();
            
        }

    }

    function _onMoreInfoClickClose(){
        $('.section-main.active').find('.moreinfo-layer').removeClass('active');

        $('.section-main-03 .text-under').removeClass('active');       
    }

    function _onMenuRightItemClick( el ){
        var _el = el.parent();
        // Close if already opened
        if( _el.hasClass('active') ){
            _el.removeClass('active');
        }else{
            _$menuright.parent().removeClass('active');
            _el.addClass('active');
        }

    }

    function _onMenuleftClick(){

        if( _isMenuLeftOpen === true ){
            // CLose
            _$menuleft.removeClass('active');
            P.Footer.closeFooterElem();
            _isMenuLeftOpen = false;
            _$overlay.removeClass('active');
            
        }else{

            _$menuleft.addClass('active');
            _isMenuLeftOpen = true;
            _$overlay.addClass('active');   
        }

    }


    return{
        init:init
    };

})();