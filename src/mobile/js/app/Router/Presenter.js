P.Presenter = function(){};

P.Presenter.prototype.init = function(){
    this.currentModule = 0;
    this.hasSeenIntro = false;

    // Classes
    this.currentView = null;

};

P.Presenter.prototype.showPage = function ( view, backgroundView ) {

    if ( this.currentView ) {

        // Close the current view
        this.currentView.close();
    }

    this.currentView = view;

    this.currentView.init();

};

P.Presenter.prototype.showHome = function(){

    $('.mod-main-module').removeClass('active');
    $('.section-mainpage').addClass('active');
    $('.section-footer').attr('data-id', 0);
    $('.backgrounds, .menuleft-all-wrapper').removeClass('home module1 module2 module3 allvideos').addClass('home');

    P.Config.currentId = 0;

    var view = P.Home;

    this.showPage( view );

    P.Social.refreshLinks('home');

};
    
P.Presenter.prototype.showModule = function( id ){
        
    $('.section-mainpage').removeClass('active');
    $('.mod-main-module').removeClass('active');
    $('.section-main-0' + id).addClass('active');
     $('.section-footer').attr('data-id', id);
     $('.backgrounds, .menuleft-all-wrapper').removeClass('home module1 module2 module3 allvideos').addClass('module'+id);

    P.Config.currentId = id;

    var view = null;
    
    if( id === 1 || id === 3 ){
        view = P.VideoModule;
    }else{
        view = P.PortraitController;
    }

    this.showPage( view );

    P.Social.refreshLinks('module' + id);

};

P.Presenter.prototype.showAllVideos = function( id ){

    $('.mod-main-module').removeClass('active');
    $('.section-main-allvideos').addClass('active');
    $('.section-footer').attr('data-id', id);
    $('.backgrounds, .menuleft-all-wrapper').removeClass('home module1 module2 module3 allvideos').addClass('allvideos');

    P.Config.currentId = id;

    var view = P.VideoAllModule;

    this.showPage( view );

    var tag = '';

    if( P.Config.getCurrentId === 1 ){
        tag = 'picasso_au_cube::si_picasso_etait::tous_les_films_mobile';
    }else{
        tag = 'picasso_au_cube::si_picasso_m_etait_reinvente::tous_les_films_mobile';
    }

    xt_med('C',xtn2Value,tag,'N');

    P.Social.refreshLinks('module4');

};

P.Presenter.prototype.picassoarte = function(){
    this.call( '' );
    setTimeout(function(){
        $('.footer-element.elem-2')[0].click();
    }, 100);
    
};

P.Presenter.prototype.call = function( url ){
        
        // Get the page only
        var splitted = url.split('/'),
            page = splitted[1];
            
        switch( page ){
            case 'module-01':
                this.showModule( 1 );
                break;
            case 'module-02':
                this.showModule( 2 );
                break;
            case 'module-03':
                this.showModule( 3 );
                break;
            case 'allvideos-module':
                this.showAllVideos( 4 );
                break;
            case '':
                this.showHome();
                break;
            default :
                this.showHome();
                break;
        }

}