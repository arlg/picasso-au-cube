var P = P ||{};

P.PortraitOffCanvas = (function(){

    var offCanvas, offCtx,
        _W, _H;

    var ctrack;

    function init(W,H){
        _W = W;
        _H = H;

        offCanvas = document.getElementById('offcanvas');
        offCanvas.width  = _W;
        offCanvas.height = _H;

        offCtx = offCanvas.getContext('2d');

        offCtx.width = _W;
        offCtx.height = _H;

        // CLMTRACKER
        // ctrack = new clm.tracker({useWebGL : true});
        // ctrack.init(pModel);

    }

    function start( video ){

        // start tracking
        // ctrack.start(video);

    }

    function update( sourceCanvas ){
        
        offCtx.clearRect(0, 0, _W, _H);
        
        offCtx.save();  

        ctrack.track( sourceCanvas );
            
        if (ctrack.getCurrentPosition()) {
            // MASK
            offCtx.strokeStyle = 'rgba(0, 0, 0, 1)';
            ctrack.draw(offCanvas);            

            var length = 19;
            var A = ctrack.getCurrentPosition().slice(0, (length));
                
            A.push(ctrack.getCurrentPosition()[22]);
            A.push(ctrack.getCurrentPosition()[21]);
            A.push(ctrack.getCurrentPosition()[20]);
            A.push(ctrack.getCurrentPosition()[19]);

            length = A.length;

            // Apply scale factor

            offCtx.moveTo(A[0][0], A[0][1]);
            
            offCtx.beginPath();

            offCtx.moveTo(A[0][0], A[0][1]);
            offCtx.lineTo(A[1][0], A[1][1]);

            for (var i = 0; i < length; i++) {

                if( ( i  ) < ( length -1 ) )
                    offCtx.lineTo(A[i+1][0], A[i+1][1]);

            }

            // offCtx.stroke();
            offCtx.closePath();
            offCtx.fillStyle = 'rgba(0, 0, 0, 1)';
            offCtx.fill();

            offCtx.clip();
            offCtx.drawImage(sourceCanvas, 0, 0);
            offCtx.restore();
                
            // cancelRequestAnimFrame(drawLoop);
        }

        /////// -------- BEFORE ->
        // offCtx.clearRect ( 0 , 0 , _W , _H );

        // var x = ( r.x +r.width/2),
        //     y = ( r.y +r.height/2),
        //     // Radii of the white glow.
        //     innerRadius = r.width,
        //     outerRadius = _H - 200,
        //     // Radius of the entire circle.
        //     radius = 60;

            
        // var grd=offCtx.createRadialGradient(x,y,innerRadius,x,y,outerRadius);

        // grd.addColorStop(0,"transparent");
        // grd.addColorStop(1,"white");

        // // Fill with gradient
        // offCtx.fillStyle=grd;
        // offCtx.fillRect(0,0,_W,_H);

    }

    function getCanvas(){
        // return offCtx.getImageData(0,0,_W,_H);
        return offCanvas;
    }

    function close(){
        if(offCtx)
            offCtx.clearRect(0, 0, _W, _H);
        // ctrack.stop(); // TODO

    }

    return{
        init:init,
        update:update,
        start:start,
        getCanvas:getCanvas,
        close: close
    }

})();