P.BackgroundAllVideosModule = (function(){

    var _SNAPBG,

        _selectableVideoPolys,
        _BGPolygons,
        _allvideoPolys,
        _backHomePolySec,

        _videoisLanched = false;
        
    function init(){
        console.log('Init BackgroundAllVideosModule');

        _SNAPBG = P.BackgroundHandler.getSNAP();

        _BGPolygons = P.BackgroundHandler.getBGPolys();   
        _allvideoPolys = P.BackgroundHandler.getVideoPolys();

        _backHomePolySec = _SNAPBG.select('#allvideos #null_37_');

        _selectableVideoPolys = _SNAPBG.selectAll('#allvideos .trigger');
        
        _animate();
        
        _checkAlreadySeen();

    }

    function _animate(){
        //Hide bg, show video
        _BGPolygons.forEach( function(elem,i) {

            elem.animate({opacity: 0}, 500, mina.easeIn);

        });

        $('.svgelement').removeClassSVG('isvisible');

        setTimeout(function(){

           _SNAPBG.select('#background').attr({ 'display': 'none' });
           _SNAPBG.select('#allvideos').attr({ 'display': 'block' });
           $('#svgclip').addClass('active');

           _initEvents();
           
           P.BackgroundHandler.changeBackgroundElements( P.Config.currentId );

           _SNAPBG.select('.home-link').attr({x: 767, y: 70});


        }, 500);
    }

    function _initEvents(){
        
        _selectableVideoPolys.forEach(function(elem, i){
            
            elem.attr('cursor', 'pointer');

            elem.mouseover(function(e){

                _videoisLanched = false;

                elem.animate({opacity:0}, 100);
                
                P.VideoAllModule.onVideoClose();
                P.VideoAllModule.onVideoLaunch( elem.attr("data-id") );

            })
            .mouseout(function(){
                elem.animate({opacity:1}, 300);

                if( !_videoisLanched )
                P.VideoAllModule.onVideoClose();
            })
            .mouseup(function(e){

                if (e.type === 'touchend') {
                
                    e.stopPropagation();
                    e.preventDefault();
                }

                _onPolyClick(elem);

            });

        });

        _backHomePolySec.attr('cursor', 'pointer');

        _backHomePolySec.mouseover(function(e){
            _backHomePolySec.animate({opacity:0}, 100);
        })
        .mouseout(function(){
            _backHomePolySec.animate({opacity:1}, 300);
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }

            $('.mod-main-module.active').find('.home-link').trigger('click');
        });

    }

    function _onPolyClick( elem ){
        
        _videoisLanched = true;

        var id = elem.attr("data-id"),
            currentStorage;
           
        currentStorage = P.Storage.get('allvideosSeen');

        if( currentStorage.indexOf( id ) === -1 ){

            currentStorage.push( id );
            P.Storage.insert('allvideosSeen', currentStorage);

        }

        _checkAlreadySeen();

        _launchVideo( id );

    }

    function _checkAlreadySeen(){

        var Arr = P.Storage.get('allvideosSeen');
        if( !Arr ) return;
        $('#allvideos .trigger').each(function(i){

            for (var y = Arr.length - 1; y >= 0; y--) {
                
                if( $(this).attr('data-id') === Arr[y] ){

                    $(this).attr('fill', '#eeeeee');
                
                }

            }

        });

    }

    function _launchVideo( id ){
        
        P.YoutubeVideo.changeVideo( id );

        P.VideoAllModule.onVideoLaunch( id );

    }

    function close(){

        console.log('remove BackgroundAllVideosModule');

        _SNAPBG.select('.home-link').attr({x: 760, y: 52});

        $('#svgclip').removeClass('active');

        // P.YoutubeVideo.stopVideo();

        _SNAPBG.select('#allvideos').attr({ 'display': 'none' });
        _SNAPBG.select('#background').attr({ 'display': 'block' });
            
        _selectableVideoPolys.forEach(function(elem, i){

            elem.attr('cursor', 'default');
            elem.unmouseover();
            elem.unmouseout();
            elem.unmouseup();

            elem = null;

        });

        _backHomePolySec.unmouseover();
        _backHomePolySec.unmouseout();
        _backHomePolySec.unmouseup();
        _backHomePolySec.attr('opacity', 1);
        _backHomePolySec.attr('cursor', 'default');

        _backHomePolySec = null;

        /// Mettre ça dans la methode qui remove bgallvideos
        /// Hide bg, show video
        _BGPolygons.forEach( function(elem,i) {

            elem.attr({opacity: 1});

        });

        _SNAPBG.select('#background').attr({ 'display': 'block' });

    }
   

    return{
        init:init,
        close:close
    };

})();