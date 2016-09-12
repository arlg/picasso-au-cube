P.Footer = (function(){

    var _footerElements,
        _footerSections,
        _isOpen,
        _elName,
        _openedEl;

    function init(){

        _isOpen = false;

        _footerElements = $('.menuleft-element');
        _footerSections = $('.section-footer');

        _initEvents();

        $('.section-footer .footer-section-content-inside').mCustomScrollbar();
        
    }

    function _initEvents(){

        //Footer link
        _footerElements.on('click', function(){

            _onFooterElementClick($(this));

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

        // If the cliked one is already open, we just close
        if( _elName === elName && _isOpen === true ){

            _isOpen = false;

        }else{

            $('.mod-footer-' + elName).addClass('active');

            el.addClass('active');

            _isOpen = true;

            //Xiti stuff
            if( elName === 'picasso' ){
                xt_med('C',xtn2Value,'picasso_au_cube::footer::c_est_quoi_picasso_au_cube_mobile','N');
            }else if( elName === 'arte'){
                xt_med('C',xtn2Value,'picasso_au_cube::footer::picasso_sur_arte_mobile','N');
            }else if( elName === 'credits'){
                xt_med('C',xtn2Value,'picasso_au_cube::footer::credits_mobile','N');
            }else if( elName === 'mention'){
                xt_med('C',xtn2Value,'picasso_au_cube::footer::mentions_legales_mobile','N');
            }else if( elName === 'mention'){
                xt_med('C',xtn2Value,'picasso_au_cube::footer::CGU_mobile','N');
            }

        }

        _elName = elName;

    }

    function closeFooterElem(){
        if( _isOpen === false ) return;

        _footerElements.removeClass('active');
        _footerSections.removeClass('active');
    }

    return{
        init:init,
        closeFooterElem:closeFooterElem
    };

})();