P.Presenter = function(){};

P.Presenter.prototype.init = function(){
    this.currentModule = 0;
    this.hasSeenIntro = false;

    // Classes
    this.currentView = null;
    this.currentBackgroundView = null;
};

P.Presenter.prototype.showPage = function ( view, backgroundView ) {

    if ( this.currentView ) {

        // Close the current view
        this.currentView.close();
        this.currentBackgroundView.close();

    }

    this.currentView = view;
    this.currentBackgroundView = backgroundView;

    this.currentView.init();
    this.currentBackgroundView.init();

};

P.Presenter.prototype.showHome = function(){

    $('.mod-main-module').removeClass('active');
    $('.section-mainpage').addClass('active');

    P.Config.currentId = 0;

    var view = P.Home,
        backgroundView = P.BackgroundHome;

    this.showPage( view, backgroundView );

    P.Social.refreshLinks('home');

};
    
P.Presenter.prototype.showModule = function( id ){
        
    $('.section-mainpage').removeClass('active');
    $('.mod-main-module').removeClass('active');
    $('.section-main-0' + id).addClass('active');

    P.Config.currentId = id;

    var view = null,
        backgroundView = null;
    
    if( id === 1 || id === 3 ){
        view = P.VideoModule;
        backgroundView = P.BackgroundVideoModule;
    }else{
        view = P.PortraitController;
        backgroundView = P.BackgroundAutoModule;
    }

    this.showPage( view, backgroundView );

    P.Social.refreshLinks('module' + id);

};

P.Presenter.prototype.showAllVideos = function( id ){

    $('.mod-main-module').removeClass('active');
    $('.section-main-allvideos').addClass('active');
    $('.section-footer').attr('data-id', id);

    P.Config.currentId = id;

    var view = P.VideoAllModule,
        backgroundView = P.BackgroundAllVideosModule;

    this.showPage( view, backgroundView );

    var tag = '';

    if( P.Config.getCurrentId === 1 ){
        tag = 'picasso_au_cube::si_picasso_etait::tous_les_films';
    }else{
        tag = 'picasso_au_cube::si_picasso_m_etait_reinvente::tous_les_films';
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
            case 'si-picasso-etait':
                this.showModule( 1 );
                break;
            case 'autoportrait':
                this.showModule( 2 );
                break;
            case 'si-picasso-m-etait-reinvente':
                this.showModule( 3 );
                break;
            case 'tous-les-films':
                this.showAllVideos( 4 );
                break;
            case '':
                this.showHome();
                break;
            // DE
            case 'waere-picasso-ein':
                this.showModule( 1 );
                break;
            case 'selbstportraet':
                this.showModule( 2 );
                break;
            case 'picasso-neu-interpretiert':
                this.showModule( 3 );
                break;
            default :
                this.showHome();
                break;
        }

}