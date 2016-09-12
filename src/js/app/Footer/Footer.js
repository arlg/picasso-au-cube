P.Footer = (function(){

    var _footerElements,
        _footerSections,
        _$overlay,
        _isOpen,
        _elName,
        _openedEl;

    function init(){

        _isOpen = false;

        _footerElements = $('.footer-element');
        _footerSections = $('.section-footer');
        _$overlay = $('.section-footer-overlay');

        P.FullscreenHandler.init();
        
        _initEvents();

        setTimeout(function(){
            _initUnderlinePositions();
        }, 100);


        $('.section-footer .footer-section-content-inside').mCustomScrollbar();
        
    }

    function _initEvents(){

        //Footer link
        _footerElements.on('click', function(){

            _onFooterElementClick($(this));

        });

        _$overlay.on('click', function(){
            _closeFooterElem();
        });

    }

    function _initUnderlinePositions(){

        _footerSections.each(function(){

            var line = $(this).find('.title-underline');
            $(this).addClass('active');
            var w = $(this).find('.content h4').width();
            w += ( parseInt($(this).find('.content').css("marginLeft"), 10) * ( 1 / 3 ) );
            
            $(this).removeClass('active');
            
            line.css('width', (w) + 'px');

        });

    }

    function _onFooterElementClick( el ){
        
        var elName = el.attr('data-element');

        // Check if opened via url
        if(window.location.href.indexOf("picasso-sur-arte") > -1) {
            P.AppRouter.navigate('/', {
                        trigger: true
                    });
        }

        _footerElements.removeClass('active');
        _footerSections.removeClass('active');

        _$overlay.removeClass('active');

        // If the cliked one is already open, we just close
        if( _elName === elName && _isOpen === true ){

            _isOpen = false;

        }else{

            $('.mod-footer-' + elName).addClass('active');
            _$overlay.addClass('active');

            el.addClass('active');

            _isOpen = true;

            //Xiti stuff
            if( elName === 'picasso' ){
                xt_med('C',xtn2Value,'picasso_au_cube::footer::c_est_quoi_picasso_au_cube','N');
            }else if( elName === 'arte'){
                xt_med('C',xtn2Value,'picasso_au_cube::footer::picasso_sur_arte','N');
            }else if( elName === 'credits'){
                xt_med('C',xtn2Value,'picasso_au_cube::footer::credits','N');
            }else if( elName === 'mention'){
                xt_med('C',xtn2Value,'picasso_au_cube::footer::mentions_legales','N');
            }else if( elName === 'mention'){
                xt_med('C',xtn2Value,'picasso_au_cube::footer::CGU','N');
            }

        }

        _elName = elName;

    }

    function _closeFooterElem(){
        if( _isOpen === false ) return;

        _footerElements.removeClass('active');
        _footerSections.removeClass('active');

        _$overlay.removeClass('active');

    }

    return{
        init:init
    };

})();