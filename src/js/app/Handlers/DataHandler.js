P.DataHandler = {

    data: {},
    isLoaded: false,

    init: function(){
        this.isLoaded = false;
        $.ajax({
            url: base+"data/arte_picasso_"+lang+".json"
        }).done(function( data ) {
            P.DataHandler.isLoaded = true;
            P.DataHandler.data = data;
        });

    }

}