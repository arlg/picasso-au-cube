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
var P = P ||{};

P.Portrait = (function(){

    // width, height
    var W, H;

    var isPictureMode = false,
        dotImg = new Image();

    var corners,
        nbpoints,
        options; // GUI

    var imageLoader;
    var facebookPicture;

    var video,
        canvas;

    var picture,
        pictureOrigW,
        pictureOrigH;

    var gui,ctx;
    var img_u8,img_gxgy,img_mag; // img_mag for sobel_edge

    var max_work_size = 160;

    var _isInit = false;

    var requestAnimId = null;

    var cameraStream;

    var _isUpsideDown;

    function init( type ){

        _initializeVars();

        // Dot for image
        dotImg.src = base + '../img/dot.png'; // Définit le chemin vers sa source

        P.PortraitOffCanvas.init(W,H);

        if( type === 'picture' ){

            canvas = document.getElementById('canvasvideo');

            _initPicture();

        }else if( type === 'webcam' ){

            video = document.getElementById('webcam');
            canvas = document.getElementById('canvasvideo');

            _initVideo();
        }else if( type === 'facebook' ){
            canvas = document.getElementById('canvasvideo');

        }

        _isInit = true;

        _initEvents();

    }
    function _initializeVars(){
        W = 0;
        H = 0;
        isPictureMode = false;
        picture = new Image();
        pictureOrigW = 0;
        pictureOrigH = 0;
        img_u8 = null;
        img_gxgy= null;
        img_mag = null;
        requestAnimId = null;
        corners = [];
        nbpoints = [];
	   _isUpsideDown = false;

	}


    function _initEvents(){
        $('.auto-button.auto-step.step-facechange.button-step1').on('click', function(){

            options.invert_colors = true;
            // options.faceDetect = true;
            this.greyscale = false;
            this.greyscale_lap = 12;

            //Remove Others
            options.has_canny_edge = false;
            options.has_sobel_edge = false;
            options.equalizehistogram = false;

            //Current
            options.has_sobel = true;
            options.radius = 1;

            options.stroke = 1;

            if( isPictureMode )
                tick();

        });

        // $('#svg svg .step-facechange.button-step2').on('click', function(){

        //      options.invert_colors = true;
        //     // options.faceDetect = true;

        //     //Remove others
        //     options.has_sobel = false;
        //     options.radius = 0;
        //     options.has_sobel_edge = false;

            
        //     //Canny
        //     options.has_canny_edge = true;
        //     options.blur_radius = 0;
        //     options.sigma = 0;
        //     options.low_threshold = 24;
        //     options.high_threshold = 52;

        //     options.equalizehistogram = true;

        //     options.stroke = 1;

        //     if( isPictureMode )
        //         tick();

        // });

        $('.auto-button.auto-step.step-facechange.button-step2').on('click', function(){

             options.invert_colors = true;
            // options.faceDetect = true;

            //Remove others
            options.has_sobel = false;
            options.radius = 0;
            options.has_sobel_edge = false;
            

            
            //Canny
            options.has_canny_edge = true;
            options.blur_radius = 1;
            options.sigma = 0;
            options.low_threshold = 20;
            options.high_threshold = 88;

            this.greyscale = true;
            this.greyscale_lap = 12;

            options.equalizehistogram = true;

            options.stroke = 2;

            if( isPictureMode )
                tick();

        });

        // $('#svg svg .step-facechange.button-step3').on('click', function(){

        //     options.invert_colors = true;
        //     // options.faceDetect = true;

        //     //Remove others
        //     options.has_sobel = false;
        //     options.radius = 0;
        //     options.has_sobel_edge = false;
        //     this.greyscale = false;
            
            

        //     //Canny
        //     options.has_canny_edge = true;
        //     options.blur_radius = 1;
        //     options.sigma = 2;
        //     options.low_threshold = 38;
        //     options.high_threshold = 48;

            

        //     options.equalizehistogram = true;

        //     options.stroke = 2;

        //     if( isPictureMode )
        //         tick();

        // });

        $('.auto-button.auto-step.step-facechange.button-step3').on('click', function(){

           options.invert_colors = true;
            // options.faceDetect = true;

            //Remove others
            options.has_sobel = false;
            options.radius = 0;
            options.has_sobel_edge = false;
            

            
            //Canny
            options.has_canny_edge = true;
            options.blur_radius = 3;
            options.sigma = 0;
            options.low_threshold = 45;
            options.high_threshold = 5;

            this.greyscale = false;
        
            options.equalizehistogram = false;

            options.stroke = 3;

            if( isPictureMode )
                tick();


        });

    }

    function _initPicture(){

        imageLoader = document.getElementById('imageLoader');
        imageLoader.addEventListener('change', _handleImage, false);

    }

    function _initVideo(){

        try {
            compatibility.getUserMedia({video: true}, function( stream ) {

                cameraStream = stream;
                try {

                    video.src = compatibility.URL.createObjectURL(stream);

                } catch ( error ) {

                    video.src = stream;

                }

                setTimeout(function() {

                    video.play();

                    P.PortraitOffCanvas.start( video );
                    
                    initalize_app( false );

                }, 500);

            }, function (error) {
                console.log(error);
                $('#canvas').hide();
                $('#no_rtc').addClass('active');
            });
        } catch (error) {
            $('#canvas').hide();
            $('#no_rtc').html('<h4>Something goes wrong...</h4>');
            $('#no_rtc').addClass('active');
        }

    }


    function initalize_app( isResize ) {

        if( _isInit === false ) return;

        var vals = P.Resizer.canvasSizes();

        W = vals._w;
        H = vals._h;

        ctx = canvas.getContext('2d');
        
        ctx.fillStyle = "rgb(0,255,0)";
        ctx.strokeStyle = "rgb(0,255,0)";

        // var scale = Math.min(max_work_size/video.videoWidth, max_work_size/video.videoHeight),
        //     w = (video.videoWidth*scale)|0,
        //     h = (video.videoHeight*scale)|0;

        // img_u8 = new jsfeat.matrix_t(W, H, jsfeat.U8C1_t);
        img_gxgy = new jsfeat.matrix_t(W, H, jsfeat.S32C2_t);
        img_u8 = new jsfeat.matrix_t(W, H, jsfeat.U8_t | jsfeat.C1_t);
        img_mag = new jsfeat.matrix_t(W, H, jsfeat.S32C1_t);

        // FACE
        // jsfeat.bbf.prepare_cascade(jsfeat.bbf.face_cascade);

        corners = [];
        var i = W*H;
        while(--i >= 0) {
            corners[i] = new jsfeat.point2d_t(0,0,0,0);
        }

        if( isResize === true && isPictureMode === false ) {
            return;
        }    
        else if( isResize === true && isPictureMode === true ){
            
            tick();
            return;
        }

        _prepareGUI();

        tick();

    }

    function tick() {

        if( !isPictureMode )
            requestAnimId = compatibility.requestAnimationFrame(tick);

        if( isPictureMode === true ){
 
            var Pw = pictureOrigW,
                Ph = pictureOrigH;

            if( _isUpsideDown === true ){
                
                // Rotate the image
                var canvasRotationCenterX = canvas.width/2;
                var canvasRotationCenterY = canvas.height/2;

                var objectRotationCenterX = picture.width/2;
                var objectRotationCenterY = picture.height/2;

                ctx.save();
                ctx.translate( canvasRotationCenterX, canvasRotationCenterY );
                ctx.rotate( 180 * Math.PI/180 );

                ctx.translate( -objectRotationCenterX, -objectRotationCenterY );

            }

            // Smaller image
            if(  Pw < W  ){

                ctx.drawImage(picture, W/2 - picture.width/2,0, picture.width, picture.height);

                if( _isUpsideDown === true ){
                   ctx.restore();
                }

            }else if( Pw > W ) {

                picture.height = ( picture.height * W ) / picture.width;

                picture.width = W;

                ctx.drawImage(picture, 0,0, picture.width, picture.height);

                if( _isUpsideDown === true ){
                   ctx.restore();
                }
             
            }

        }else{
            ctx.drawImage(video, 0, 0, W, H);  
        }

        _tickImageOperations();
            
    }//end tick

    function _tickImageOperations(){
        nbpoints.length = 0;
        
        var imageData = ctx.getImageData(0, 0, W, H);

        // P.PortraitOffCanvas.update( canvas );
        /*
        if(options.faceDetect === true){

            jsfeat.imgproc.grayscale(imageData.data, img_u8.data);

            // possible options
            //jsfeat.imgproc.equalize_histogram(img_u8, img_u8);
            
            var pyr = jsfeat.bbf.build_pyramid(img_u8, 24*2, 24*2, 4);

            var rects = jsfeat.bbf.detect(pyr, jsfeat.bbf.face_cascade);
            rects = jsfeat.bbf.group_rectangles(rects, 1);

            // draw only most confident one
            draw_faces(ctx, rects, canvasWidth/img_u8.cols, 1);

        }*/

        // Send info to off canvas drawing head
        

        if( options.faceDetect === true ){
            P.PortraitOffCanvas.update( canvas );

            ctx.clearRect(0, 0, W, H);

            ctx.drawImage(P.PortraitOffCanvas.getCanvas(), 0, 0);
        }

        var imageData = ctx.getImageData(0, 0, W, H);

        if( options.has_global_threshold === true ){
            var pixe  = Filters.threshold( imageData, options.global_threshold|0 );
        }else{
            var pixe = imageData;
        }

        if( options.greyscale === true  ){
            pixe  = Filters.greyscale(pixe)
        }

        // Canny Edge
        if( options.has_canny_edge === true ){
            
            jsfeat.imgproc.grayscale(pixe.data, img_u8.data);

            // HISTOGRAM
            if( options.equalizehistogram === true ){
                jsfeat.imgproc.equalize_histogram(img_u8, img_u8);
            }

            var r = options.blur_radius|0;
            var kernel_size = (r+1) << 1;
            var sigma = options.sigma|0;

            jsfeat.imgproc.gaussian_blur(img_u8, img_u8, kernel_size, sigma);

            jsfeat.imgproc.canny(img_u8, img_u8, options.low_threshold|0, options.high_threshold|0);

            // render result back to canvas
            var data_u32 = new Uint32Array(pixe.data.buffer);
            var alpha = (0xff << 24);
            var i = img_u8.cols*img_u8.rows,
                pix = 0;
            
            while(--i >= 0) {
                pix = img_u8.data[i];
                data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
            }
        }

        //SOBEL
        if( options.has_sobel === true ){

            jsfeat.imgproc.grayscale(imageData.data, img_u8.data);

            // BLUR
            if( options.radius !== 0 ){
                 var r = options.radius|0;
                var kernel_size = (r+1) << 1;
                    jsfeat.imgproc.gaussian_blur(img_u8, img_u8, kernel_size, 0);
            }
           

            // HISTOGRAM
            if( options.equalizehistogram === true ){
                jsfeat.imgproc.equalize_histogram(img_u8, img_u8);
            }

            jsfeat.imgproc.sobel_derivatives(img_u8, img_gxgy);

            // render result back to canvas
            var data_u32 = new Uint32Array(imageData.data.buffer);
            var alpha = (0xff << 24);
            var i = img_u8.cols*img_u8.rows, pix=0, gx = 0, gy = 0;
            while(--i >= 0) {
                gx = img_gxgy.data[i<<1];
                gy = img_gxgy.data[(i<<1)+1];
                pix = (Math.abs(gx) + Math.abs(gy))&0xff;

                data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
            }

        }

        //SOBEL_EDGE
        if( options.has_sobel_edge === true ){

            jsfeat.imgproc.grayscale(imageData.data, img_u8.data);

            jsfeat.imgproc.gaussian_blur(img_u8, img_u8, 3);

            jsfeat.imgproc.sobel_derivatives(img_u8, img_gxgy);

            var i = img_u8.cols*img_u8.rows, gx = 0, gy = 0;
            var x=0,y=0,dx=0,dy=0;
            var agx=0, agy=0;
            var gd=img_gxgy.data, mag=img_mag.data, id=img_u8.data;

            while(--i >= 0) {
                gx = gd[i<<1];
                gy = gd[(i<<1)+1];
                mag[i] = gx*gx + gy*gy;
            }

            for(y = 1; y < img_u8.rows - 1; ++y) {
                i = (y * img_u8.cols + 1)|0;
                for(x = 1 ; x < img_u8.cols - 1; ++x, ++i) {

                    gx = gd[i<<1];
                    gy = gd[(i<<1)+1];
                    agx = ((gx ^ (gx >> 31)) - (gx >> 31))|0;
                    agy = ((gy ^ (gy >> 31)) - (gy >> 31))|0;
                    
                    if(gx > 0) dx = 1;
                    else dx = -1;

                    if(gy > 0) dy = img_u8.cols;
                    else dy = -img_u8.cols;
                        
                    var a1, a2, b1, b2, A, B, point;
                    if(agx > agy) {
                        a1 = mag[i+dx];
                        a2 = mag[i+dx+(-dy)];
                        b1 = mag[i-dx];
                        b2 = mag[i-dx+dy];
                        A = (agx - agy)*a1 + agy*a2;
                        B = (agx - agy)*b1 + agy*b2;
                        point = mag[i] * agx;
                        if(point >= A && point > B) {
                            id[i] = agx&0xff;
                        }
                        else {
                            id[i] = 0x0;
                        }
                    } else  {
                        a1 = mag[i+(-dy)];
                        a2 = mag[i+dx+(-dy)];
                        b1 = mag[i+dy];
                        b2 = mag[i-dx+dy];
                        A = (agy - agx)*a1 + agx*a2;
                        B = (agy - agx)*b1 + agx*b2;
                        point = mag[i] * agy;
                        if(point >= A && point > B) {
                            id[i] = agy&0xff;
                        }
                        else {
                            id[i] = 0x0;
                        }                           
                    }
                }
            }

            // render result back to canvas
            var data_u32 = new Uint32Array(imageData.data.buffer);
            var alpha = (0xff << 24);
            var pix = 0;
            i = img_u8.cols*img_u8.rows;
            while(--i >= 0) {
                pix = id[i];
                data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
            }

        }

        var newPix = pixe;

        if( options.invert_colors === true){
            
            for(var i = 0; i < newPix.data.length; i += 4) {
                  // red
                  newPix.data[i] = 255 - newPix.data[i];
                  // green
                  newPix.data[i + 1] = 255 - newPix.data[i + 1];
                  // blue
                  newPix.data[i + 2] = 255 - newPix.data[i + 2];
            }

        }

        ctx.putImageData(newPix, 0, 0);


        if( options.stroke !== 1 ){
            for(var z = 0, n = newPix.data.length; z < n; z += 4) {

                var red = newPix.data[z];
                var green = newPix.data[z + 1];
                var blue = newPix.data[z + 2];

                var posX = (z / 4) % W;
                var posY = Math.floor((z / 4) / W);

                if( red === 0 && green === 0 && blue === 0){
              
                    ctx.drawImage(dotImg, ( posX - options.stroke / 2)  , ( posY - options.stroke / 2), options.stroke, options.stroke);

                }

            }//endfor
        }

    }

    function render_corners(corners, count, img, step) {
        var pix = (0xff << 24) | (0x00 << 16) | (0xff << 8) | 0x00;
        for(var i=0; i < count; ++i)
        {
            var x = corners[i].x,
                y = corners[i].y,
                off = (x + y * step);
                
            nbpoints.push([x, y]);
        }
    }

    //HAAR
    /*
     function draw_faces(ctx, rects, sc, max) {

        var on = rects.length;
        if(on && max) {
            jsfeat.math.qsort(rects, 0, on-1, function(a,b){return (b.confidence<a.confidence);})
        }
        var n = max || on;
        n = Math.min(n, on);
        var r;
        
        for(var i = 0; i < n; ++i) {
            r = rects[i];

            P.PortraitOffCanvas.update(r);

            var I =  P.PortraitOffCanvas.getImage(),
                img = new Image();
                
            img.src = I;

            ctx.drawImage(img, 0, 0); //the true context of the canvas
            
        }

    }
    */

    function _handleImage( e ){

        var reader = new FileReader();
        
        reader.onload = function(event){
            
            picture.onload = function(){

                isPictureMode = true;
                 
                pictureOrigW = picture.width;
                pictureOrigH = picture.height;

                 setTimeout(function() {

                    P.PortraitController.changeStep( 'facechange' );
                    initalize_app( false );
                    
                }, 500);
                
            };
            
            picture.src = event.target.result;

        };
        reader.readAsDataURL(e.target.files[0]);

        var file = this.files[0];  // file
        fr   = new FileReader; // to read file contents


        fr.onloadend = function() {
            // get EXIF data
            var exif = EXIF.readFromBinaryFile(new BinaryFile(this.result));

            if( exif.Orientation === 3 ){
                _isUpsideDown = true;
            }

        };

        fr.readAsBinaryString(file); // read the file
    }

    function _handleFacebookImage(){
        
        picture.onload = function(){

            isPictureMode = true;
             
            pictureOrigW = picture.width;
            pictureOrigH = picture.height;

             setTimeout(function() {

                P.PortraitController.changeStep( 'facechange' );
                initalize_app( false );
                
            }, 500);
            
        };

        picture.src = facebookPicture;

    }

    function getOptions(){
        return options;
    }

    // Take picture at the end
    function takePicture(){
        //Takes a picture of the current image and save it, redirects to next page once done
        
        return canvas.toDataURL();

    }

    function setFacebookPicture( pic ){
 
        convertImgToBase64(pic, function( base64Img ){
            
            facebookPicture = base64Img;
            _handleFacebookImage();
            
        });

    }

    function _prepareGUI(){
        options = new P.PortraitConf();
        gui = new dat.GUI();

        gui.add(options, 'has_global_threshold');
        gui.add(options, 'global_threshold', 1, 255).step(1);
        gui.add(options, 'red', 0, 1).step(0.01);
        gui.add(options, 'blue', 0, 1).step(0.01);
        gui.add(options, 'green', 0, 1).step(0.01);

        gui.add(options, 'greyscale');
        gui.add(options, "greyscale_lap", 1, 255);

        gui.add(options, 'has_canny_edge');
        gui.add(options, 'blur_radius', 0, 4).step(1);
        gui.add(options, 'sigma', 0, 10).step(1);
        gui.add(options, 'low_threshold', 1, 127).step(1);
        gui.add(options, 'high_threshold', 1, 127).step(1);
        
        gui.add(options, 'has_sobel');
        gui.add(options, 'radius', 0, 10).step(1);
        gui.add(options, 'has_sobel_edge');
        gui.add(options, 'invert_colors');

        gui.add(options, 'stroke', 1, 20).step(1);

        gui.add(options, 'faceDetect');
        gui.add(options, 'equalizehistogram');
    }

    /** 
        Ends everything 
    **/
    function close(){

        console.log('Portrait Close');

        gui.destroy();

        compatibility.cancelAnimationFrame( requestAnimId );

        if( ctx ){
            ctx.clearRect(0, 0, W, H);
        }

        _initializeVars();

        if( typeof imageLoader !== 'undefined' )
            imageLoader.removeEventListener('change', _handleImage, false);

        $('#svg svg .step-facechange.button-step1').hammer().off('tap');

        $('#svg svg .step-facechange.button-step2').hammer().off('tap');

        $('#svg svg .step-facechange.button-step3').hammer().off('tap');

        P.PortraitOffCanvas.close();

        // Stop camera
        if( isPictureMode === false ){

            if( cameraStream ){
                video.pause();
                video.src = '';
                video.load();
                cameraStream.stop();
                cameraStream = null;
            }
        }

        // Close vars

        _isInit = false;
    }

    return{
        init:init,
        getOptions:getOptions,
        takePicture:takePicture,
        setFacebookPicture:setFacebookPicture,
        initalize_app:initalize_app,
        close:close
    };

})();

var P = P ||{};

// Controller for autoportrait -- Handles main changes
P.PortraitController = (function(){
    "use strict";

    var _currentStep = null,
        _$steps,

        // Buttons triggers
        _$photoButton,
        _$fbButton,
        _$validateButton,
        _$homeImage,
        _$gallery,

        _$galleryFBWrapper,

        _$buttonRestart,
        _$buttonOpenGallery,

        // Closes
        _$close,
        _$closeGallery,

        // End buttons
        _$buttonSave,
        _$buttonSaveGallery,

        _isGallery = false;


    function init(){
        console.log('Init Portrait');
        
        P.PortraitImage.init();

        // Vars
        
        _$steps = $('.mod-auto-step'); // HTML

        _$photoButton = $('.auto-button.button-photo');
        _$fbButton = $('.auto-button.button-facebook');

        _$homeImage = $('.mod-auto-step.step-home .left-side img');

        _$gallery = $('.mod-auto-gallery');
        _$buttonRestart = $('.auto-button.button-end-retry');

        _$galleryFBWrapper = $('.mod-auto-step.step-facebook-01 .mod-auto-left');

        // Closes
        _$close = $('.close-auto');
        _$closeGallery = $('.close-gallery');

        _currentStep = $('.mod-auto-step.step-home');

        _$buttonOpenGallery = $('.auto-button.step-home.button-opengallery');

        changeStep('start');

        _initEvents();

        _testBrowserSupport();

        $('.gallery-container').mCustomScrollbar();

    }

    function _testBrowserSupport(){

        // IE9
        if( window.FileReader === undefined ){
            
            _$photoButton.addClassSVG('inactive');

            $('.mod-auto-step.step-picture .input-field').hide();
            $('.mod-auto-step.step-picture .notsupported').addClass('active');

        }

    }

    // Click on one of the 3 choices
    function changeStep( _currentState ){
        
        console.log('- changeStep ->  ' + _currentState);

        var currentState = _currentState;

        _currentStep.removeClass('active');

        _$close.addClassSVG('active');

        if( currentState === 'facechange' ){

            _currentStep = $('.mod-auto-step.step-facechange');

        }else if( currentState === 'picture' ){
            _currentStep = $('.mod-auto-step.step-picture');

        }else if( currentState === 'facebook-01' ){
            _currentStep = $('.mod-auto-step.step-facebook-01');

        }else if( currentState === 'end' ){

            _currentStep = $('.mod-auto-step.step-end');


        }else if( currentState === 'start' ){

            _currentStep = $('.mod-auto-step.step-home');

            _$close.removeClassSVG('active');
        }

        _currentStep.addClass('active');

        if( currentState ===  'facebook-01' || currentState ===  'picture' ){
            _$homeImage.removeClass('active');
        }

    }

    function _initEvents(){

        $('.auto-button').hammer({tapMaxTime:300}).on('tap', function(){
            $('.auto-button').removeClassSVG('current');
            $(this).addClass('current');
        });

        _$photoButton.hammer({tapMaxTime:300}).on('tap', function(){
            changeStep( 'picture' );
            P.Portrait.init('picture');
            $('.info-webcam').removeClass('active');
        });

        _$fbButton.hammer({tapMaxTime:300}).on('tap', function(){

            P.PortraitFacebook.login( 
                function( _state ){
                    _createFBGalleryStep1( _state );
                }
            )

            $('.info-webcam').removeClass('active');

        });

        _$buttonOpenGallery.hammer({tapMaxTime:300}).on('tap', function(){

            showGallery();

        });

        ///// CLOSES
        _$close.hammer({tapMaxTime:300}).on('tap', function(){ 
                
            close();
            init();

        });

        _$closeGallery.hammer({tapMaxTime:300}).on('tap', function(){ 
                
            if(  _isGallery === true  ){
                _closeGallery();
            }

        });


        // RESTART
        _$buttonRestart.hammer({tapMaxTime:300}).on('tap', function(){

            changeStep('start');
            resume();

        });

        
    }

    /**
        _state = true si Facebook connecté
        false si erreur
    **/
    function _createFBGalleryStep1( _state ){

        changeStep('facebook-01');

        // We're good to go to step 2
                
        P.PortraitFacebook.getUserPictures(function(){

            _createFBGalleryStep2( P.PortraitFacebook.getPicturesArray() );

        });
        

    }

    function _createFBGalleryStep2( _pictures ){

        var picturesLength = _pictures.length,
            domWrapper = $(document.createElement('div'));

        _$galleryFBWrapper.find('div').unbind().remove();

        for (var j = picturesLength - 1; j >= 0; j--) {

            var photWrap = $( document.createElement('div') ),
                pic = $( document.createElement('img') );

                pic.attr({
                    'src': _pictures[j],
                    'class' : 'facebookphoto'
                });
            
            photWrap.append( pic );
                
            domWrapper.append(photWrap);

            _$galleryFBWrapper.append(domWrapper);
        }

        _prepareGallerySelection();
    }

    function _prepareGallerySelection(){

        $(document).off('click','.facebookphoto');
        $('.mod-auto-step.step-facebook-01 .mod-auto-button-valid-gallery').off('click');

        $(document).on('click','.facebookphoto', function(){

            $('.facebookphoto').removeClass('active');
            $(this).addClass('active');

        });
    
        // Validate button
        $('.mod-auto-step.step-facebook-01 .mod-auto-button-valid-gallery').on('click', function(){
              
              P.Portrait.init( 'facebook' );
              P.Portrait.setFacebookPicture( $('.facebookphoto.active').attr('src') );
              
        });

    }

    function showGallery(){

        $('#svg svg #autoportrait .step-gallery.auto-title').addClassSVG('active');

        _currentStep.removeClass('active');

        _$gallery.addClass('active');
        _$closeGallery.addClassSVG('active');
        _isGallery = true;

        xt_med('C',xtn2Value,'picasso_au_cube::si_picasso_me_dessinait::la_galerie_complete_mobile','N');

    }

    function _closeGallery(){
        $('#svg svg #autoportrait .step-gallery.auto-title').removeClassSVG('active');

        _currentStep.addClass('active');

        _$gallery.removeClass('active');
        _$closeGallery.removeClassSVG('active');
        _isGallery = false;
    }

    function close(){

        console.log('- PortraitController Close');

        _closeGallery();
        changeStep('start');

        _$photoButton.hammer().off('tap');
        
        _$closeGallery.hammer().off('tap');
        _$close.hammer().off('tap');
        _$buttonRestart.hammer().off('tap');
        _$fbButton.hammer().off('tap');
        _$photoButton.hammer().off('tap');
        $('.auto-button').hammer().off('tap');
        
        stopApp();

        P.PortraitImage.close();
    }


    /***
        RESTART EVERYTHING
    ***/

    function stopApp(){

        P.Portrait.close();

    }
    function resume(){
        stopApp();

        close();

        init();

    }

    return{
        init:init,
        close:close,
        changeStep:changeStep,
        showGallery:showGallery,
        stopApp:stopApp
    };

})();
// Main Controller for the Section 2  : Autoportrait
P.PortraitFacebook = (function(){

    var _$fbConnectButton,

        _isConnected,

        _userAlbums,
        _userPictures = [];

    function init(){

        _isConnected = false;
        _isParseAlbumsDone = false;
        _isParsePicsDone = false;

        _$fbConnectButton = $('.mod-auto-button-facebook');

        _$fbConnectButton.removeClass('inactive');

        _fbConnectHandler();

    }

    function login( callback ){
        
        // Connect on click on the facebook button
        FB.login(function(response) {

              if (response.authResponse) {
                  
                  console.log('->Welcome!  Fetching your information.... ');
                  callback( true );

              } else {

                 console.log('User cancelled login or did not fully authorize.');
                 callback( false );

              }
          }, {scope:'user_photos, publish_stream, publish_actions'}

        );

    }

    function _fbConnectHandler(){
          
          /* Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired for any authentication related change, such as login, logout or session refresh. This means that whenever someone who was previously logged out tries to log in again, the correct case below will be handled. */
          FB.Event.subscribe('auth.authResponseChange', function(response) {

              if (response.status === 'connected') {
                  // The pêrson is logged
                  console.log('User already connected');
                    
                    _isConnected = true;

                    _onFBUserConnected();

              } else if (response.status === 'not_authorized') {
                  console.log('not_authorize');
                  _login();
              } else {
                
                  // Not logged into Facebook, so we prompt to
                  _login();
              }
          });
    }

    function _onFBUserConnected(){
        
    }

    function _createGallery( albums ){

        
    }

    function getUserPictures( callback ){

        if(  P.PortraitFacebook.getPicturesArray().length > 0 ) {
            callback();
            return;
        }

        var albumCount = 0;

        FB.api('/me/albums', function(response){

            if (!response || response.error) {
                alert(P.DataHandler.data.autoportrait.facebook_error);
            } else {
                
                _userAlbums = response.data;

                for (var i = 0; i < _userAlbums.length; i++) {

                    FB.api( _userAlbums[i].id+'/photos', function( response ){

                        for (var j = 0; j < response.data.length; j++) {
                            P.PortraitFacebook.setPicturesArray( response.data[j].source );
                        }

                        albumCount++;

                        if( albumCount === _userAlbums.length ){
                            callback();
                        }

                    });
                }
            }
           
        });
    }
    function sharePicture( source ){

      FB.api('/me/photos', 'post', {
            message: P.DataHandler.data.social.facebook_autoportrait.title + " - " + P.DataHandler.data.social.facebook_autoportrait.description + ' - '+ document.URL,
            url:source        
        }, function(response){

            if (!response || response.error) {
                // alert('Error occured');
                console.log(response);
            } else {
                // alert('Post ID: ' + response.id);
                alert(P.DataHandler.data.autoportrait.success_facebook);
            }

      });// Photo

    }

    function close(){

          

    }

    function setPicturesArray( el ){
        
        _userPictures.push( el );

    }

    function getPicturesArray( ){
        
        return _userPictures;

    }

    return{
        init:init,
        login:login,
        getUserPictures:getUserPictures,
        setPicturesArray:setPicturesArray,
        getPicturesArray:getPicturesArray,
        sharePicture:sharePicture,
        close:close

    };

})();


/**
    Handles Main image and User - interaction Events
**/
P.PortraitImage = (function(){

    var
        _$validateButton,
        _$buttonSave,
        _$buttonSaveGallery,

        // Social Buttons
        _$autoShareFB,
        _$autoShareTW,
        _$autoShareGP,

        // Final Image
        _finalImageData,
        _imageName,
        _imageUrl,

        // Flags

        _hasPublishedToGallery = false;

    function init(){
        console.log('PortraitImage init');

        _hasPublishedToGallery = false;

        _$validateButton = $('.auto-button.button-facechange-validate');
        _$buttonSave = $('.auto-button.button-save');
        _$buttonSaveGallery = $('.auto-button.button-addgallery');
        
         // Social
        _$autoShareFB = $('.auto-button.button-share-facebook');
        _$autoShareTW = $('.auto-button.button-share-twitter');
        _$autoShareGP = $('.auto-button.button-share-google');

        _initEvents();

    }

    function _initEvents(){

        _$validateButton.on('click', function(){
            
            _onValidateImage();

        });


        _$buttonSave.on('click', function(){
            
            _saveToUserComputer(); 

        });

        _$buttonSaveGallery.on('click', function(){

            _publishToGallery();

        });

        // SHARE
        // SOCIAL
        _$autoShareFB.on('click', function(){ _onShareFB(); });
        _$autoShareTW.on('click', function(){ _onShareTW(); });

    }

    function _onValidateImage(){

        _finalImageData = P.Portrait.takePicture();
        P.PortraitController.changeStep( 'end' );

        $( '.mod-auto-step-end-image' ).attr( 'src', _finalImageData );

        _imageName = GetDate();
        _imageUrl = domain + base + 'img/userportraits/'+ _imageName + '.png';

        $.ajax({
            type: "POST",
            url: base+'php/imagesaveserver.php',
            data: { image: _finalImageData, name: _imageName },
            success: function(e){
                if( e === '0' ){
                    console.log('Image sauvegardée');
                }else{
                    console.log(e);
                }
            },
            error: function(r){
                console.log(r);
            }
        });

        P.PortraitController.stopApp();

    }

    function _saveToUserComputer(){
        var Cs = new CanvasSaver(base+'php/imagesaver.php');
        Cs.save( 'saveanimage',  _finalImageData, 'sipicassomedessinait');
    }

    function _publishToGallery(){

        if( _hasPublishedToGallery === false  ){
            $('.gallery-container').append('<div class="gallery-item"><img src="'+_imageUrl+'" alt=""></div>');
            alert(P.DataHandler.data.autoportrait.add_gallery_success);
            _hasPublishedToGallery = true;
        }else{
            alert(P.DataHandler.data.autoportrait.add_gallery_error);
        }

    }

    function _onShareFB(){

        P.PortraitFacebook.login( function(){

            P.PortraitFacebook.sharePicture( _imageUrl );

        } );

    }

    function _onShareTW(){

        P.Social.shareImageTwitter( _imageUrl );

    }

    function close(){

        console.log('Close PortraitImage');
        _hasPublishedToGallery = false;
        _$buttonSave.off('click');
        _$buttonSaveGallery.off('click');
        _$validateButton.off('click');

        _$autoShareFB.off('click', function(){ _onShareFB(); });
        _$autoShareTW.off('click', function(){ _onShareTW(); });

        _finalImageData = '';

    }

    return{
        init:init,
        close:close
    }

})()

P.PortraitConf = function (){

    this.blur_radius = 2;
    this.sigma = 0;
    this.low_threshold = 20;
    this.high_threshold = 50;
    this.global_threshold = 125;
    this.has_canny_edge = false  ;
    this.has_global_threshold = false;
    this.has_sobel = false;
    this.radius = 0;
    this.has_sobel_edge = false;
    this.invert_colors = false;
    this.stroke = 1;

    //Threshold
    this.red = 0.2126;
    this.blue = 0.7152;
    this.green = 0.0722;

    // test
    this.greyscale = false;
    this.greyscale_lap = 125;

    this.faceDetect = false;

    this.equalizehistogram = false;

};
var Filters = {};

Filters.threshold = function(pixels, threshold) {
    var d = pixels.data;
    for (var i=0; i<d.length; i+=4) {
        var r = d[i];
        var g = d[i+1];
        var b = d[i+2];
        var v = ((P.Portrait.getOptions().red)*r + (P.Portrait.getOptions().green)*g + (P.Portrait.getOptions().blue)*b >= threshold) ? 255 : 0;
        d[i] = d[i+1] = d[i+2] = v
    }
    return pixels;
};

Filters.greyscale = function(pixels){
    var d = pixels.data;
    for (var i=0; i<d.length; i+=4) {
        
        var r = d[i];
        var g = d[i+1];
        var b = d[i+2];
        var f = ( parseInt((r + g + b), 10) ) / 3;

        f = parseInt(( f - P.Portrait.getOptions().greyscale_lap), 10 );

        d[i] = d[i+1] = d[i+2] = f;
    }
    return pixels;
};

function convertImgToBase64(url, callback, outputFormat){
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img,0,0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        canvas = null; 
    };
    img.src = url;
};


function CanvasSaver(url) {
     
    this.url = url;
     
    this.savePNG = function(cnvs, fname) {
        if(!cnvs || !url) return;
        fname = fname || 'picture';
         
        // var data = cnvs.toDataURL("image/png");
        data = cnvs;

        data = data.substr(data.indexOf(',') + 1).toString();
         
        var dataInput = document.createElement("input") ;
        dataInput.setAttribute("name", 'imgdata') ;
        dataInput.setAttribute("value", data);
        dataInput.setAttribute("type", "hidden");
         
        var nameInput = document.createElement("input") ;
        nameInput.setAttribute("name", 'name') ;
        nameInput.setAttribute("value", fname + '.png');
         
        var myForm = document.createElement("form");
        myForm.method = 'post';
        myForm.action = url;
        myForm.appendChild(dataInput);
        myForm.appendChild(nameInput);
         
        document.body.appendChild(myForm) ;
        myForm.submit() ;
        document.body.removeChild(myForm) ;
    };
     
    this.save = function (label, cnvs, fname) {
        // var btn = document.createElement('button'), scope = this;
        // btn.innerHTML = label;
        // btn.style['class'] = 'canvassaver';
        // btn.addEventListener('click', function(){scope.savePNG(cnvs, fname);}, false);
         
        // document.body.appendChild(btn);

    this.savePNG(cnvs, fname);
         
        
    };
}

function GetDate(){

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    var curHour = today.getHours() > 12 ? today.getHours() : (today.getHours() < 10 ? "0" + today.getHours() : today.getHours());
    var curMinute = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    var curSeconds = today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds();

    if(dd<10) {
        dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 

    return yyyy + '-' + mm+'-'+dd + '--' + curHour + '-' + curMinute + '-' + curSeconds;


}

  // Lets us get random numbers from within a range we specify. From MDN docs.
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
var P = P || {};
P.Config = {

    LANG : "",
    // Change during execution
    isFirstTime : true,
    isFirstTimeVideoModule : false,
    currentId : 0,
    isDebug : true,
    isTouchDevice: false

};
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
        }).error(function(r){
            console.log(r);
        });

    }

}
P.Home = (function(){

    var  _currentId,
        _$textSVGModules,
        _$textModules,
        _$textNumbers,
        _introAnimCount = 1,
        _$selector;

    function init(){
        console.log('Home init');
            

        if( _currentId === undefined ) 
            _currentId = 2;

        // Texts
        _$textSVGModules = $('.mainpage-selector-item');
        _$textModules = $('.mainpage-selector-item-link');
        _$textNumbers = $('.mainpage-number');
        _$validateButton = $('.mainpage-validate-button');

        _initEvents();

    }

    function _initEvents(){

        _$validateButton.on('click', function(){
            $('.mainpage-selector-item-link.active').trigger('click');
        });

    }

    function onChooseClick(){

        if( _currentId < 2 ) _currentId ++;
        else                _currentId = 0;

        _$textSVGModules
            .removeClassSVG('active')
            .eq( _currentId )
            .addClassSVG('active');

        _$textModules
            .removeClass('active')
            .eq( _currentId )
            .addClass('active');

        _$textNumbers
            .removeClassSVG('active')
            .eq( _currentId )
            .addClassSVG('active');


    }

    function close(){
        console.log('Home Close');

        _$validateButton.off('click');
    }

    function introAnimationNumbers(){
        
        $('.mainpage-subtitle').addClassSVG('isvisible');
    
        _$textSVGModules.addClassSVG('isvisible');
        $('.mainpage-number').addClassSVG('isvisible');
        $('.mainpage-number.number-03').addClassSVG('active');

        setTimeout(function(){

            _introAnimNumber();

        }, 1800)
    
    };

    function _introAnimNumber(){

        onChooseClick();

        _introAnimCount++;
        if( _introAnimCount < 4 ){
            setTimeout(function(){
                _introAnimNumber();
            }, 1400);
        }else if( _introAnimCount === 4){
            //Everything is done
            P.event_aggregator.trigger( 'onHomeIntroComplete' );
        }

    };

    return{
        init:init,
        introAnimationNumbers:introAnimationNumbers,
        onChooseClick:onChooseClick,
        close:close
    };

})();
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
/***********************
    @author Aurelien G.
    Mobile version
    http://www.arlg.me 
***********************/

var P = P ||{};

$(function () {});

$(window).load(function(){
    P.App.init();
});

P.App = (function(){

    function init(){

        _initEvents();

        P.DataHandler.init();
        
        P.VideoWrapper.init();

        P.YoutubeVideo.init();
        
        P.RouterEvents.init();
        
        P.Social.init();

        P.Storage.init();
        P.Resizer.init();
        P.Footer.init();

        P.Menus.init();

        P.AppRouter = new P.Router();

        // PICASSO.DEV
        Backbone.history.start({ pushState: 'pushState' in window.history, root: '/mobile' });

        // IP Local
        // Backbone.history.start({ pushState: 'pushState' in window.history, root: 'picasso/build/mobile' });

        // PREPROD
        // Backbone.history.start({ pushState: 'pushState' in window.history, root: '/_GUEST/picasso/mobile' });

        // IOS 7 CRAP
        $(window).on('orientationchange', function () {
            window.scrollTo(0, 0);
        });

        $(window).on('scroll', function () {
          var focusedElement;

          if ($(document).scrollTop() !== 0) {
            focusedElement = $(':focus');
            if (!(focusedElement.is('input') || focusedElement.is('textarea'))) window.scrollTo(0, 0);
          }
        });

    }

    function _initEvents(){

        //Adds an event aggregator
        P.event_aggregator = _.extend({}, Backbone.Events);

    }

    return {
        init : init
    };

})();
P.Resizer = (function(){

    var
        _WH = 0,
        _WW = 0,

        _$content,
        _$autoLeft,
        _$canvases,
        _$autoLeft,

        _SVGRATIO = 1368/868,

        _autoLeftWnum,
        _autoLeftHnum;

    function init(){

        _$content = $('.content-wrapper');
        _$autoLeft = $('.mod-auto-step.step-facechange .left-side');
        _$canvases = $('#canvasvideo, #offcanvas');
        _onResize();

        //Resize BG
        var lazyLayout = _.debounce(_onResize, 100);
        $(window).resize(lazyLayout);

    }

    function _onResize(){

        _WH = $(window).height();
        _WW = $(window).width();

        // Adjusting with the header
        var contentHeight = ( _WW < 880 ) ? _WH - 50 : _WH - 100;

        var vals = canvasSizes();
        
        P.Portrait.initalize_app( true );

    }

    function canvasSizes(){

        _$autoLeft.css({
            'height' :  parseInt(( _$autoLeft.width() * 350 )  / 480, 10) + 'px'
        });


        var autoLeftW = _$autoLeft.css('width'),
            autoLeftH = _$autoLeft.css('height'),
            _autoLeftWnum = parseInt(autoLeftW, 10),
            _autoLeftHnum = parseInt(autoLeftH, 10);

        _$canvases.attr('width', autoLeftW);
        _$canvases.attr('height', autoLeftH);

        return { _w: _autoLeftWnum, _h: _autoLeftHnum };

    }


    return{
        init:init,
        canvasSizes:canvasSizes
    };

})();
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
P.RouterEvents = (function(){
    
    function init(){

        _appLinkRouter();

    }

    // Routes links to the router, giving the arguments
    function _appLinkRouter(){
        $( document ).hammer().on('tap', 'a[href^="/"]', function(event) {

            var href, passThrough, url;
            href = $(event.currentTarget).attr('href');
            // passThrough = href.indexOf('sign_out') >= 0;
            if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
                event.preventDefault();
                url = href.replace('/', '');

                url = lang + '/' + url;

                P.AppRouter.navigate(url, {
                    trigger: true
                });
                
                return false;
            }
        });
    }

    return {
        init : init
    };

})();
function get_short_url(long_url, func)
{   
    $.getJSON(
        "https://api-ssl.bitly.com/v3/shorten?callback=?",
        {
            "format": "json",
            "apiKey": "R_688a0439e2463ef84d344f599caa208b",
            "login": "arlg",
            "longUrl": long_url
        },
        function(response)
        {
            func( response.data.url );
        }
    );
}


P.Social = (function(){

    var _$footerFB;

    function init(){

        _$footerFB = $('.menubot-element-social.elem-6 a');
        _$footerTW = $('.menubot-element-social.elem-7 a');

        $.ajaxSetup({ cache: true });
        $.getScript('//connect.facebook.net/fr_FR/all.js', function(){
            
            FB.init({
                appId      : '263786353803104',
                status     : true, // check login status
                cookie     : true, // enable cookies to allow the server to access the session
                xfbml      : true  // parse XFBML
            });

        });

        ////



        ////

        _initEvents();
    }

    function _initEvents(){


    }

    function _onFBShare( id ){
        
        var objname = {};
        var someObject = "facebook_" + id;

        var fbDatas = [
            encodeURIComponent( document.URL ),
            encodeURIComponent( window.location.origin + '/img/share.jpg' ),
            encodeURIComponent( P.DataHandler.data.social[someObject].title ), // Taken on the page's opengraphs
            encodeURIComponent( P.DataHandler.data.social[someObject].description )
        ];

        var fbLink = 'http://www.facebook.com/sharer.php?s=100&p[url]=' + fbDatas[0] + '&p[images][0]=' + fbDatas[1] + '&p[title]=' + fbDatas[2] + '&p[summary]=' +fbDatas[3];

        _$footerFB.attr('href', fbLink);
    }

    function _onTWShare( id ){

         get_short_url(document.URL, function(short_url) {

            var objname = {};
            var someObject = "twitter_" + id;

            var twDatas =[
                encodeURIComponent( short_url ),
                encodeURIComponent(P.DataHandler.data.social[someObject])
            ];

            var twLink = 'https://twitter.com/intent/tweet?text='+ twDatas[1] +'&url='+ twDatas[0];

            _$footerTW.attr('href', twLink);

        });


    }

    function shareImageTwitter( source ){

        var twDatas =[
            encodeURIComponent( document.URL ),
            'Texte de partage :  ' + source,
        ];



        var twLink = 'https://twitter.com/intent/tweet?text='+ twDatas[1] +'&url='+ twDatas[0];

        window.open(twLink, '_blank');

    }

    function refreshLinks( id ){

        if( P.DataHandler.isLoaded === true ){
                    _onFBShare( id );
                    _onTWShare( id );
        }else{
            setTimeout(function(){
                refreshLinks(id)
            }, 500);
        }
    }

    return{
        init:init,
        shareImageTwitter:shareImageTwitter,
        refreshLinks:refreshLinks

    }
})();
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
/*
 * .addClassSVG(className)
 * Adds the specified class(es) to each of the set of matched SVG elements.
 */
$.fn.addClassSVG = function(className){
    $(this).attr('class', function(index, existingClassNames) {
        return existingClassNames + ' ' + className;
    });
    return this;
};

/*
 * .removeClassSVG(className)
 * Removes the specified class to each of the set of matched SVG elements.
 */
$.fn.removeClassSVG = function(className){
    $(this).attr('class', function(index, existingClassNames) {
        var re = new RegExp(className, 'g');
        return existingClassNames.replace(re, '');
    });
    return this;
};

// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

function isIE () {
  var myNav = navigator.userAgent.toLowerCase();
  return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
}
P.VideoAllModule = (function(){

    function init(){
        console.log('Init VideoAllModule');

        $('.ascenceur-inside').mCustomScrollbar();

        _checkAlreadySeen();
        _initEvents();
    }

    function _initEvents(){

        P.event_aggregator.bind( 'onOverlayClicked', function(){
            
            P.VideoWrapper.toggleVideoWrapper( 'hide' );
            onVideoClose();
        });

        $('.ascenceur-wrapper li').on('click', function(){

            _onOpenVideo($(this).attr('data-youtubeid'));

        });

    }

    function onVideoLaunch( _id ){

        $('.section-main-allvideos .video-name[data-youtubeid="'+_id+'"]').addClass('active');
        $('.section-main-allvideos .page-title').addClass('inactive');

    }

    function onVideoClose(){
        $('.section-main-allvideos .video-name').removeClass('active');
        $('.section-main-allvideos .page-title').removeClass('inactive');

    }

    function _onOpenVideo( id ){

        var currentStorage;
           
        currentStorage = P.Storage.get('allvideosSeen');
        
        if( currentStorage.indexOf( id ) === -1 ){

            currentStorage.push( id );
            P.Storage.insert('allvideosSeen', currentStorage);

        }

        _checkAlreadySeen();

        onVideoLaunch(id);
        P.YoutubeVideo.changeVideo( id );

    }

    function _checkAlreadySeen(){

        var Arr = P.Storage.get('allvideosSeen');
        if( !Arr ) return;
        $('.ascenceur-inside li').each(function(i){

            for (var y = Arr.length - 1; y >= 0; y--) {
                
                if( $(this).attr('data-youtubeid') === Arr[y] ){

                    $(this).addClass('isseen');
                
                }

            }

        });

    }

    function close(){
        console.log('Close VideoAllModule');

        P.event_aggregator.unbind( 'onOverlayClicked' );
        P.VideoWrapper.toggleVideoWrapper( 'hide' );

    }

    return{
        init:init,
        onVideoLaunch:onVideoLaunch,
        close:close
    };

})();
P.VideoModule = (function(){

    var 
        _$listItem,
        _$listWrapper,
        
        _$relaunchBtn,
        _$showAllButton,
        _$videoPlayButton,

        _catHeight = 0,
        _wrapperHeight = 0,
        _max = 0,
        _currentId = 0,
        _loadVideoTimeout,
        _isFirstRoulette,
        _isSeeMoreOpen = false,

        _arrayIdSeen,

        _demoTimer,
        _demoCounter;

    function init(){

        console.log('Init VideoModule');
        _demoCounter = 0;
        _isFirstRoulette = true;

        _arrayIdSeen  = [];

        _$listItem = $('.section-main.active header li');
        _$listWrapper = $('.section-main.active header ul');
        _$relaunchBtn = $('.action-button.button-relaunch');
        _$videoPlayButton = $('.video-play-button');

        P.VideoWrapper.toggleVideoWrapper('show');

        _max = _$listItem.length;
        _max--;

        setTimeout(function(){
            initPosition();    
        }, 200);
        
        _initEvents();

        if( P.Config.isFirstTimeVideoModule === true){
            _initializeDemo();
        }

    }

    function _fakeRelaunchClick(){
        
        _demoCounter++ ;

        if( _demoCounter === 4 ){
            P.VideoWrapper.toggleVideoWrapper('show');
            P.Config.isFirstTimeVideoModule = false;
            _changeWheel();
            return; 
        }

        _$relaunchBtn[0].click();

        _demoTimer = setTimeout( function(){

            _fakeRelaunchClick();

        }, 1000);

    }

    function _initializeDemo(){

        P.VideoWrapper.toggleVideoWrapper('hide');

        _isFirstRoulette = false; // We want animation

        _demoTimer = setTimeout( function(){

            _fakeRelaunchClick();

        }, 1000);
        

    }

    function close(){
        console.log('Close VideoModule');

        P.YoutubeVideo.stopVideo();
        P.VideoWrapper.toggleVideoWrapper( 'hide' );

        _max = 0;
        clearTimeout(_loadVideoTimeout);
        clearTimeout(_demoTimer);
        _$relaunchBtn.off('click');
        _$videoPlayButton.off('click');

        P.event_aggregator.unbind( 'onSeeMoreOpen');
        P.event_aggregator.unbind( 'onSeeMoreClose');
        P.event_aggregator.unbind( 'onOverlayClicked');

    }

    function _initEvents(){

        _$relaunchBtn.on('click', function(){
            _onRandomRoulette();
        });

        _$videoPlayButton.on('click', function(){
            _onShowVideo();
        });

        P.event_aggregator.bind( 'onSeeMoreOpen', function(){
            _onseeMoreOpen();
        });

        P.event_aggregator.bind( 'onSeeMoreClose', function(){
            _onseeMoreClose();
        });

        P.event_aggregator.bind( 'onOverlayClicked', function(){
            _onHideVideo();
        });

    }

    function _onseeMoreOpen(){
        $('.mod-main-module header ul li.active').nextAll().hide();
        _$videoPlayButton.removeClass('isvisible');
        _isSeeMoreOpen = true;

        P.YoutubeVideo.pauseVideo();

    }

    function _onseeMoreClose(){
        $('.mod-main-module header ul li').show();
        _$videoPlayButton.addClass('isvisible');
        _isSeeMoreOpen = false;

    }

    function _onHideVideo(){

        P.YoutubeVideo.pauseVideo();

        P.VideoWrapper.toggleVideoWrapper( 'hide' );

        _$videoPlayButton.addClass('isvisible');

    }

    function _onShowVideo(){

        P.VideoWrapper.toggleVideoWrapper( 'show' );

        if( P.Config.isTouchDevice === false ){
            P.YoutubeVideo.playVideo();
        }else{
            //Change youtube video
            var id = _$listItem.eq( _currentId ).attr('data-youtubeid');
            loadVideo( id );
        }

        _$videoPlayButton.removeClass('isvisible');

    }

    function _onRandomRoulette(){

        if( _isSeeMoreOpen === true  ) return;

        var nextId = Math.floor( ( Math.random() * _max ), 10 );

        if( nextId === _currentId  ){
            _onRandomRoulette();
            return;
        }

        _currentId = nextId;

        _changeWheel();

        // Check if already seen
        _currentId = nextId;
        if( P.Config.isFirstTimeVideoModule === false ){

            if( _arrayIdSeen.length === _max ){
                _arrayIdSeen.length = 0;
            }

            if( _arrayIdSeen.indexOf( _currentId ) > -1 ){
                _onRandomRoulette();
                return;

            }else{

                _arrayIdSeen.push( _currentId );
            }

        }

        _changeWheel();

        // Xiti
        var tag = '';
        if(  P.Config.currentId === 1 ){
            tag = 'picasso_au_cube::si_picasso_etait::relancer_mobile';
        }else{
            tag = 'picasso_au_cube::si_picasso_m_etait_reinvente::relancer_mobile';
        }

        xt_med('C',xtn2Value,tag,'A');

    }

    function initPosition( ){

        _wrapperHeight = _$listWrapper.outerHeight();
        _catHeight = _$listItem.outerHeight();
        
        _currentId = parseInt( ( (_$listItem.length/2) - 1 ) , 10);

        resizeList();
        
        _changeWheel();
    }

    function _changeWheel(){
            
        _$listItem
            .removeClass('active one two three')
            .eq( _currentId )
            .addClass('active')
            .prev().addClass('one')
            .prev().addClass('two')
            .prev().addClass('three')
            .end().end().end()
            .next().addClass('one')
            .next().addClass('two')
            .next().addClass('three');

        // Calculte pos
        var curr = _$listItem.eq( _currentId ), 
            prevs = curr.prevAll();

        var gotoid = 0;

        prevs.each(function(i){

            gotoid+= $(this).height() + 2;

        });

        if( _isFirstRoulette === false ){
            _$listWrapper.addClass('hastrasition');
        }

         _$listWrapper.css({
            '-moz-transform': 'translate(0, -'+gotoid+'px)',
            '-ms-transform': 'translate(0, -'+gotoid+'px)',
            '-webkit-transform': 'translate(0, -'+gotoid+'px)',
            'transform': 'translate(0, -'+gotoid+'px)'
        });

         if( P.Config.isFirstTimeVideoModule === true ) return;


        //Wait for some time and Change youtube video
        _loadVideoTimeout = setTimeout(function(){
            var id = _$listItem.eq( _currentId ).attr('data-youtubeid');
            loadVideo( id );    
        }, 600);


        _isFirstRoulette = false;
    }

    function _showAllVideos(){

        P.VideoWrapper.toggleVideoWrapper( 'hide' );

    }

    function loadVideo( id ){
        
        P.YoutubeVideo.changeVideo( id );

    }

    function getCurrentId(){
        return _currentId;
    }

    function resizeList(){

        if( !_$listWrapper ) return;

        var arr = [], max = 0;

        _$listWrapper.css('width', '100%');

        _$listItem.each(function(){

            var wasActive = false;

            if( $(this).hasClass('active') ){
                wasActive = true;
            }

            $(this).addClass('active');
            arr.push($(this).outerWidth());

            if( wasActive === false )
                $(this).removeClass('active');
            
        });

        max = Math.max.apply(Math, arr);

        if( $(window).width() <= 480 && max > 150) max = 150;
        _$listWrapper.css('width', max);  

    }

    return{
        init:init,
        close:close,
        loadVideo:loadVideo,
        resizeList:resizeList,
        getCurrentId:getCurrentId
    };

})();
P.VideoWrapper = (function(){

    var _$videoWrapper,
        _wasActive;

    function init(){

        _$videoWrapper = $('.mod-video');

        _wasActive = false;

        P.event_aggregator.bind( 'onSeeMoreOpen', function(){
            _onseeMoreOpen();
        } );

        P.event_aggregator.bind( 'onSeeMoreClose', function(){
            _onseeMoreClose();
        } );

    }

    function _onseeMoreOpen(){
        if( _$videoWrapper.hasClass('active') ){
            _wasActive = true;
            toggleVideoWrapper('hide');
        }
    }
    function _onseeMoreClose(){
        if( _wasActive === true ){
            _wasActive = false;
            toggleVideoWrapper('show');
        }
    }

    // State : show or hide
    function toggleVideoWrapper( state ){

        if( state === 'show' )
            _$videoWrapper.addClass('active');
        else
            _$videoWrapper.removeClass('active');

    }

    return{
        init:init,
        toggleVideoWrapper:toggleVideoWrapper
    }

})();
P.YoutubeVideo = (function(){
    var _player,
        _isReady,
        _lockStart = false,  // Used if the pause is fired before start
        _$overlay,
        _isAPILoaded
        _prevEventData = 5000;


    function init(){
        
        _isReady = false;
        _isAPILoaded = false;

        _$overlay = $('.mod-video-overlay');
        _$closeVideo = $('.close-video');

        // 2. This code loads the IFrame Player API code asynchronously.
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        _initEvents();
    }

    function _initEvents(){

        _$overlay.on('click', function(){    
            _onOverlayClicked(false);
        });


        _$closeVideo.on('click', function(){

            _onOverlayClicked(true);
        });
    }

    function _onOverlayClicked( isCloseBtn ){

        if( _player ){
            _player.pauseVideo();
            stopVideo();
        }

        $('.mod-video-overlay').removeClass('active');
        
        P.event_aggregator.trigger( 'onOverlayClicked' );

        if(  isCloseBtn === true ){
            P.VideoWrapper.toggleVideoWrapper( 'hide' );
        }

    }

    function changeVideo( id ){
        console.log('changevideo :: ' + id);

        _$overlay.addClass('active');

        // If API not available, recall it later
        if( _isAPILoaded === false ){

            setTimeout(function(){
                changeVideo( id );
            }, 1000);

            return;

        }

        // Else we rereate the embed
        // if( _player ){

        //     _player.destroy();
        //     $('.mod-video iframe').unbind().remove();
        //     $('.mod-video').append('<div id="player"></div>');
        //     _player = null;

        // }

        $('.mod-video iframe').unbind().remove();
        $('.mod-video').append('<div id="player"></div>');

        // _player = new YT.Player('player', {
        //     height: '100%',
        //     width: '100%',
        //     videoId: id,
        //     playerVars: {
        //         controls:1,
        //         showinfo:1,
        //         modestbranding: 1
        //     },
        //     events: {
        //       'onReady': _onPlayerReady,
        //       'onStateChange': _onPlayerStateChange
        //     }
        // });

        // For mobiles : use iframe embed 
        $('.mod-video #player').append('<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/'+id+'?showinfo=0" allowfullscreen frameborder="0"></iframe>');

        P.VideoWrapper.toggleVideoWrapper( 'show' );

        //
    
        $('.mod-video').css({
            marginTop: ( $(window).height() / 2 - $('.mod-video').outerHeight()/2 ) + "px"
        });
    }

    function onYouTubeIframeAPIReady(){

        _isAPILoaded = true;

    }

    // 4. The API will call this function when the video player is ready.
    function _onPlayerReady() {
            
        _isReady = true;

        if( P.Config.isTouchDevice === false ){

            _player.playVideo();    
        }
        

    }

    // 5. The API calls this function when the player's state changes.
    function _onPlayerStateChange(event) {
        
        if(event.data === 0) {          
            // End
            // _playFor1sec();
        }else if( event.data === 1 ) {
            //Playing
            _isPlaying();
        }else if( event.data === 2 && _prevEventData === 1 ){
            _isPaused();
        }

        _prevEventData = event.data;

    }

    function _isPlaying(){
        
        _$overlay.addClass('active');

    }

    function _isPaused(){

        _$overlay.removeClass('active');
    }

    function stopVideo() {

        if ( _player )
            _player.stopVideo();

    }

    function pauseVideo() {

        if ( !_player ){

            _lockStart = true;

        }else{
            _player.pauseVideo();
        }

    }

    function playVideo() {

        _player.playVideo();

    }

    // function getIsReady(){
    //     return _isReady;
    // }

    return{
        init:init,
        onYouTubeIframeAPIReady:onYouTubeIframeAPIReady,
        changeVideo:changeVideo,
        stopVideo:stopVideo,
        pauseVideo:pauseVideo,
        playVideo:playVideo
    };

})();

function onYouTubeIframeAPIReady() {
      
      P.YoutubeVideo.onYouTubeIframeAPIReady();
}