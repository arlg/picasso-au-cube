P.Storage = {

    init : function(){

        // Create
        if( this.get('allvideosSeen') === null ){
            this.insert('allvideosSeen', []);
        }

    },

    ///// Storage methods
    // Global insert key :: value
    insert : function( key, data ){
        window.localStorage.setItem( key , JSON.stringify( data ));
    },

    get : function( key ){
        return JSON.parse( window.localStorage.getItem( key ) );
    }

};