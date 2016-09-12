P.Router = Backbone.Router.extend({

    routes : {
        '*lang/' : 'index',
        '*lang/si-picasso-etait' : 'first',
        '*lang/autoportrait'  : 'second',
        '*lang/si-picasso-m-etait-reinvente'  : 'third',
        '*lang/tous-les-films' : 'allvideos',
        '*lang/picasso-sur-arte' : 'picassoarte',
        '*lang/picasso-auf-arte' : 'picassoarte',
        '*lang/waere-picasso-ein' : 'first',
        '*lang/selbstportraet'  : 'second',
        '*lang/picasso-neu-interpretiert'  : 'third',
        '*lang/alle-filme-sehen'  : 'allvideos',
        '*lang/*' : 'index',
    },

    initialize : function(  ) {

        this.presenter = new P.Presenter(  );
        this.presenter.init();

    },

    index : function() {
        this.presenter.showHome();

    },


    first : function() {
        this.presenter.showModule( 1 );
        xt_med('C',xtn2Value,'picasso_au_cube::si_picasso_etait_mobile','N');
    },

    second : function() {
        this.presenter.showModule( 2 );
        xt_med('C',xtn2Value,'picasso_au_cube::si_picasso_me_dessinait_mobile','N');
    },

    third : function() {
        this.presenter.showModule( 3 );
        xt_med('C',xtn2Value,'picasso_au_cube::si_picasso_m_etait_reinvente_mobile','N');
    },

    allvideos: function(){
        this.presenter.showAllVideos( 4 );
    },

    picassoarte : function(){
        this.presenter.picassoarte();
    },
    
    notFound: function () {
        alert('Not Found');
    }

});