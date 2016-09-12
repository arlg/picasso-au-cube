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

    var backgroundColors, currentColor;

    function init( type ){

        _initializeVars();

        // Dot for image
        dotImg.src = base + 'img/dot.png'; // Définit le chemin vers sa source

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
        currentColor = "white";
        backgroundColors = {

            "white" : [255, 255, 255],
            "one"   : [249, 229, 29],    //#f9e51d
            "two"   : [193, 225, 218],    //#c1e1da
            "three" : [238, 160, 74],    //#eea04a
            "four"  : [219, 217, 145],    //#dbd991
            "five"  : [243, 171, 154]    //#F3AB9A

        };

        _isUpsideDown = false;
    }


    function _initEvents(){

        $('#svg svg .step-facechange.button-step1').on('click', function(){

            options.invert_colors = true;
            
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

        $('#svg svg .step-facechange.button-step2').on('click', function(){
            
             options.invert_colors = true;

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

            this.greyscale = false;

            options.equalizehistogram = false;

            options.stroke = 2;

            if( isPictureMode )
                tick();

        });

        $('#svg svg .step-facechange.button-step3').on('click', function(){

           options.invert_colors = true;
        

            //Remove others
            options.has_sobel = false;
            options.radius = 0;
            options.has_sobel_edge = false;
            
            
            //Canny
            options.has_canny_edge = true;
            options.blur_radius = 3;
            options.sigma = 5;
            options.low_threshold = 80;
            options.high_threshold = 40;

            this.greyscale = false;
        
            options.equalizehistogram = false;

            options.stroke = 2;

            if( isPictureMode )
                tick();


        });


        $('#svg svg .step-facechange.button-step4 .button-color').on('click', function(){

            $('#svg svg .step-facechange.button-step4 .button-color').removeClassSVG('active');
            $(this).addClassSVG('active');

            currentColor = $(this).attr('data-color');

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

                    $('.info-webcam').removeClass('active');

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

            // If larger
            }else if( Pw > W && Ph < H ) {
                
                picture.height = ( picture.height * W ) / picture.width;

                picture.width = W;

                ctx.drawImage(picture, 0,0, picture.width, picture.height);

                if( _isUpsideDown === true ){
                   ctx.restore();
                }
             
            }else if( Ph > H  ){
            
                picture.height = H;

                picture.width = ( H * pictureOrigW ) / pictureOrigH; 

                ctx.drawImage(picture, W/2 - picture.width/2,0, picture.width, picture.height);

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

        // Background color
        if( currentColor !== 'white' ){

            var imageData = ctx.getImageData(0, 0, W, H),
                colors = backgroundColors[currentColor],
                thelength = imageData.data.length;

            for(var i = 0; i < thelength; i += 4) {

                if( imageData.data[i] >= 240 ){
                    
                    // red
                    imageData.data[i] = colors[0];
                    // green
                    imageData.data[i + 1] = colors[1];
                    // blue
                    imageData.data[i + 2] = colors[2];
                }       
            }

            ctx.putImageData(imageData, 0, 0);
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
        
        // if( typeof gui === "undefined" ){
        //     console.log('---GUI');
            gui = new dat.GUI();
        // }
        

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

        gui.add(options, 'equalizehistogram');
    }

    /** 
        Ends everything 
    **/
    function close(){

        console.log('Portrait Close');

        compatibility.cancelAnimationFrame( requestAnimId );

        gui.destroy();

        if( ctx ){
            ctx.clearRect(0, 0, W, H);
        }

        _initializeVars();

        if( typeof imageLoader !== 'undefined' )
            imageLoader.removeEventListener('change', _handleImage, false);

        $('#svg svg .step-facechange.button-step1').off('click');

        $('#svg svg .step-facechange.button-step2').off('click');

        $('#svg svg .step-facechange.button-step3').off('click');

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
        _currentStepSVG = null,
        _$steps,

        // Buttons triggers
        _$webcamButton,
        _$photoButton,
        _$fbButton,
        _$validateButton,
        _$homeImage,
        _$gallery,

        _$galleryFBWrapper,

        _$buttonRestart,

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

        _$webcamButton = $('.auto-button.button-webcam');
        _$photoButton = $('.auto-button.button-photo');
        _$fbButton = $('.auto-button.button-facebook');

        _$homeImage = $('#svg #autoportrait .home-image');

        _$gallery = $('.mod-auto-gallery');
        _$buttonRestart = $('#svg #autoportrait .button-end-retry');

        _$galleryFBWrapper = $('.mod-auto-step.step-facebook-01 .mod-auto-left');

        // Closes
        _$close = $('svg .close-auto');
        _$closeGallery = $('svg .close-gallery');

        _currentStep = $('.mod-auto-step.step-home');
        _currentStepSVG = $('#svg #autoportrait .step-home');

        changeStep('start');

        _initEvents();

        _testBrowserSupport();

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

        _currentStepSVG.removeClassSVG('active');

        _$close.addClassSVG('active');

        if( currentState === 'facechange' ){

            _currentStep = $('.mod-auto-step.step-facechange');
            _currentStepSVG  = $('#svg #autoportrait .step-facechange');

        }else if( currentState === 'picture' ){
            _currentStep = $('.mod-auto-step.step-picture');

        }else if( currentState === 'facebook-01' ){
            _currentStep = $('.mod-auto-step.step-facebook-01');

        }else if( currentState === 'end' ){

            _currentStep = $('.mod-auto-step.step-end');

            _currentStepSVG  = $('#svg #autoportrait .step-end ');


        }else if( currentState === 'start' ){

            _currentStep = $('.mod-auto-step.step-home');

            _currentStepSVG  = $('#svg #autoportrait .step-home');

            _$close.removeClassSVG('active');
        }

        _currentStep.addClass('active');

        _currentStepSVG.addClassSVG('active');

        if( currentState ===  'facebook-01' || currentState ===  'picture' ){
            _$homeImage.removeClassSVG('active');
        }

    }

    function _initEvents(){

        $('.auto-button').on('click', function(){
            $('.auto-button').removeClassSVG('current');
            $(this).addClassSVG('current');
        });
        
        _$webcamButton.on('click', function(){
            changeStep( 'facechange' );
            P.Portrait.init('webcam');
            $('.info-webcam').addClass('active');
        });

        _$photoButton.on('click', function(){
            changeStep( 'picture' );
            P.Portrait.init('picture');
            $('.info-webcam').removeClass('active');
        });

        _$fbButton.on('click', function(){

            P.PortraitFacebook.login( 
                function( _state ){
                    _createFBGalleryStep1( _state );
                }
            )

            $('.info-webcam').removeClass('active');

        });

        ///// CLOSES
        _$close.on('click', function(){ 
                
            close();
            init();

        });

        _$closeGallery.on('click', function(){ 
                
            if(  _isGallery === true  ){
                _closeGallery();
            }

        });


        // RESTART
        _$buttonRestart.on('click', function(){

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
			
		domWrapper.addClass('wrapper');

        _$galleryFBWrapper.find('div').unbind().remove();

        for (var j = picturesLength - 1; j >= 0; j--) {

            var photWrap = $( document.createElement('div') ),
                pic = $( document.createElement('img') );
				
				photWrap.attr('class', 'facebookphoto');
			
                pic.attr({
                    'src': _pictures[j]
                });
            
            photWrap.append( pic );
                
            domWrapper.append(photWrap);

            _$galleryFBWrapper.append(domWrapper);
        }
		
		$('.mod-auto-step.step-facebook-01 .mod-auto-left').mCustomScrollbar();

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
              P.Portrait.setFacebookPicture( $('.facebookphoto.active img').attr('src') );
              
        });

    }

    function showGallery(){

        $('#svg svg #autoportrait .step-gallery.auto-title').addClassSVG('active');

        _currentStepSVG.removeClassSVG('active');
        _currentStep.removeClass('active');
        

        _$gallery.addClass('active');
        _$closeGallery.addClassSVG('active');
        _isGallery = true;

        xt_med('C',xtn2Value,'picasso_au_cube::si_picasso_me_dessinait::la_galerie_complete','N');

    }

    function _closeGallery(){
        $('#svg svg #autoportrait .step-gallery.auto-title').removeClassSVG('active');

        _currentStepSVG.addClassSVG('active');
        _currentStep.addClass('active');

        _$gallery.removeClass('active');
        _$closeGallery.removeClassSVG('active');
        _isGallery = false;
    }

    function close(){

        console.log('- PortraiController Close');

        _closeGallery();
        changeStep('start');

        $('#svg #autoportrait .auto-step').removeClassSVG('active');

        _$webcamButton.off('click');
        _$photoButton.off('click');
        
        _$closeGallery.off('click');
        _$close.off('click');
        _$buttonRestart.off('click');
        _$fbButton.off('click');
        _$photoButton.off('click');
        _$webcamButton.off('click');
        $('.auto-button').off('click');

        _$close.removeClassSVG('active');
        
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
				
				P.PortraitController.changeStep('start');
				
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

        _$validateButton = $('#svg svg .button-facechange-validate');
        _$buttonSave = $('#svg svg .button-save');
        _$buttonSaveGallery = $('#svg svg .button-addgallery');
        
         // Social
        _$autoShareFB = $('#svg svg .button-share-facebook');
        _$autoShareTW = $('#svg svg .button-share-twitter');
        _$autoShareGP = $('#svg svg .button-share-google');

        _initEvents();

    }

    function _initEvents(){

        _$validateButton.on('click', function(){
            
            _onValidateImage();

        });


        _$buttonSave.on('click', function(){
            console.log('-- ');
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
        _imageUrl = base + 'img/userportraits/'+ _imageName + '.png';

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
P.BackgroundData = {

    states : [
        [
            '#F9D306',
            '#F9D306',
            '#f9d306',
            '#ffdf09',
            '#ffc600',
            '#F9E51D', // 5
            '#F9E51D',
            '#F9D306',
            '#F9D306',
            '#F9E51D',
            '#F9D306',
            '#F9E51D',
            '#F9D306',
            '#F9E51D',//13
            '#F9D306',
            '#F9E51D',
            '#F9E51D', // 16
            '#F9E51D',
            '#F9E51D',
            '#F9E51D',
            '#F9D306',
            '#F9E51D',
            '#fcef78', // 23
            '#fcef78',
            '#F9D306',
            '#F9D306',
            '#F9E51D',
            '#F9D306',
            '#ffc600',
            '#F9E51D', // 30
            '#F9E51D',
            '#F9D306',
            '#F9E51D',
            '#F9D306',
            '#F9E51D', // 35
            '#F9D306',
            '#F9E51D',
            '#F9E51D', // 38
            '#F9E51D',
            '#F9D306', //40
            '#F9E51D',
            '#F9E51D',
            '#F9E51D',
            '#F9E51D',
            '#F9D306', // 45
            '#F9D306',
            '#F9E51D',
            '#F9D306',
            '#F9E51D',
            '#F9E51D', // 50
            '#F9D306',
            '#F9E51D',
            '#F9E51D',
            '#F9E51D',
            '#F9D306', //55
            '#F9E51D',
            '#F9D306',
            '#F9E51D',
            '#F9E51D',
            '#F9E51D', // 60
            '#F9E51D',
            '#F9D306',
            '#F9E51D',
            '#F9E51D',
            '#F9E51D', // 65
            '#F9E51D',
            '#F9E51D',
            '#F9D306',
            '#F9D306',
            '#F9D306' // 70


        ],
        [
            '#FFFFFF',
            '#BEDCCD',
            '#FFFFFF',
            '#BEDCCD',
            '#C1E1DA',// 5
            '#C1E1DA', 
            '#BEDCCD',
            '#C1E1DA',
            '#BEDCCD',
            '#C1E1DA',// 10
            '#FFFFFF', 
            '#C1E1DA',
            '#C1E1DA',//13
            '#C1E1DA',
            '#BEDCCD',
            '#BEDCCD',// 16
            '#BEDCCD', 
            '#C1E1DA',
            '#C1E1DA',
            '#BEDCCD',// 20
            '#FFFFFF', 
            '#BEDCCD',// 22
            '#BEDCCD', 
            '#BEDCCD',
            '#BEDCCD',// 25
            '#FFFFFF', 
            '#C1E1DA',
            '#C1E1DA',
            '#BEDCCD', 
            '#6FC1B6', // 30
            '#FFFFFF',
            '#C1E1DA',
            '#BEDCCD',
            '#C1E1DA',
            '#BEDCCD', // 35
            '#C1E1DA',
            '#FFFFFF',
            '#C1E1DA', // 38
            '#FFFFFF',
            '#BEDCCD', //40
            '#C1E1DA',
            '#C1E1DA',
            '#BEDCCD',
            '#BEDCCD',
            '#C1E1DA', // 45
            '#BEDCCD',
            '#C1E1DA',
            '#C1E1DA',
            '#FFFFFF',
            '#BEDCCD', // 50
            '#50A6AC',
            '#C1E1DA',
            '#BEDCCD',
            '#FFFFFF',
            '#C1E1DA', //55
            '#BEDCCD',
            '#FFFFFF',
            '#FFFFFF',
            '#BEDCCD',
            '#BEDCCD', // 60
            '#FFFFFF',
            '#C1E1DA',
            '#FFFFFF',
            '#BEDCCD',
            '#C1E1DA', // 65
            '#BEDCCD',
            '#C1E1DA',
            '#BEDCCD',
            '#FFFFFF',
            '#C1E1DA' // 70
        ],
        [
            '#FFFFFF',
            '#ED8D49',
            '#FFFFFF',
            '#ED8D49',
            '#EEA04A',// 5
            '#EEA04A', 
            '#ED8D49',
            '#EEA04A',
            '#ED8D49',
            '#EEA04A',// 10
            '#FFFFFF', 
            '#EEA04A',
            '#EEA04A',//13
            '#EEA04A',
            '#ED8D49',
            '#ED8D49',// 16
            '#ED8D49', 
            '#EEA04A',
            '#ED8D49',
            '#EEA04A',// 20
            '#FFFFFF', 
            '#ED8D49',// 22
            '#ED8D49', 
            '#ED8D49',
            '#ED8D49',// 25
            '#FFFFFF', 
            '#EEA04A',
            '#EEA04A',
            '#ED8D49', 
            '#000000', // 30
            '#FFFFFF',
            '#EEA04A',
            '#ED8D49',
            '#EEA04A',
            '#ED8D49', // 35
            '#EEA04A',
            '#FFFFFF',
            '#ED8D49', // 38
            '#EEA04A',
            '#FFFFFF', //40
            '#EEA04A',
            '#EEA04A',
            '#ED8D49',
            '#ED8D49',
            '#EEA04A', // 45
            '#ED8D49',
            '#EEA04A',
            '#EEA04A',
            '#FFFFFF',
            '#EF9D53', // 50
            '#ED8D49',
            '#EEA04A',
            '#ED8D49',
            '#FFFFFF',
            '#EEA04A', //55
            '#ED8D49',
            '#FFFFFF',
            '#FFFFFF',
            '#ED8D49',
            '#ED8D49', // 60
            '#FFFFFF',
            '#EEA04A',
            '#FFFFFF',
            '#ED8D49',
            '#EEA04A', // 65
            '#ED8D49',
            '#EEA04A',
            '#ED8D49',
            '#FFFFFF',
            '#EEA04A' // 70
        ],
        [
            '#FFFFFF',
            '#D1CF94',
            '#FFFFFF',
            '#D1CF94',
            '#DBD991',// 5
            '#DBD991', 
            '#D1CF94',
            '#DBD991',
            '#D1CF94',
            '#DBD991',// 10
            '#FFFFFF', 
            '#DBD991',
            '#DBD991',//13
            '#DBD991',
            '#D1CF94',
            '#D1CF94',// 16
            '#D1CF94', 
            '#DBD991',
            '#DBD991',
            '#D1CF94',// 20
            '#FFFFFF', 
            '#D1CF94',// 22
            '#D1CF94', 
            '#D1CF94',
            '#D1CF94',// 25
            '#FFFFFF', 
            '#DBD991',
            '#DBD991',
            '#D1CF94', 
            '#000000', // 30
            '#FFFFFF',
            '#DBD991',
            '#D1CF94',
            '#DBD991',
            '#D1CF94', // 35
            '#DBD991',
            '#FFFFFF',
            '#DBD991', // 38
            '#FFFFFF',
            '#D1CF94', //40
            '#DBD991',
            '#DBD991',
            '#D1CF94',
            '#D1CF94',
            '#DBD991', // 45
            '#D1CF94',
            '#DBD991',
            '#DBD991',
            '#FFFFFF',
            '#D1CF94', // 50
            '#BCA841',
            '#DBD991',
            '#D1CF94',
            '#FFFFFF',
            '#DBD991', //55
            '#D1CF94',
            '#FFFFFF',
            '#FFFFFF',
            '#D1CF94',
            '#D1CF94', // 60
            '#FFFFFF',
            '#DBD991',
            '#FFFFFF',
            '#D1CF94',
            '#DBD991', // 65
            '#D1CF94',
            '#DBD991',
            '#D1CF94',
            '#FFFFFF',
            '#DBD991' // 70
        ]
    ]
};
/*
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     width="100%" height="100%" viewBox="-349.801 0.25 1462 824" enable-background="new -349.801 0.25 1462 824"
     xml:space="preserve" preserveAspectRatio="xMinYMin slice">
*/

P.BackgroundHandler = (function(){

    var _BGPolygons,
        _BGPolygonsInside, 
        _BGPolygonsOutside,
        _VIDEOPolygons,
        _SNAP,
        _SNAPCLIP,
        _BGPolyLengthInside,
        _BGPolyLengthOutside,

        _$svgElement,

        _color,
        _colorsArray = [],
        _reversedColorsArray = [];

    function init(){

        _SNAP = Snap("#svg svg");
        _SNAPCLIP = Snap("#svgclip svg");

        //Push all polygons in ordered array
        _BGPolygons = _SNAP.selectAll("#background path");
        _VIDEOPolygons = _SNAP.selectAll('#allvideos path');

        _BGPolygonsInside = _SNAP.selectAll("#background #inside path");
        _BGPolygonsOutside =  _SNAP.selectAll("#background #outside path");

        _BGPolyLengthInside = _BGPolygonsInside.length;
        _BGPolyLengthOutside= _BGPolygonsOutside.length;

        _$svgElement = $('.svgelement');

        P.BackgroundCommon.init();

        P.Resizer.resizeSVG();

         // Change the scale of the clips 
        var clips = _SNAPCLIP.selectAll('path');

        clips.forEach( function(elem) {
            elem.transform( 's0.98' );
        });

    
    }


    function changeBackground( id ){

        _$svgElement.removeClassSVG('isvisible');

        $('.section-footer').attr('data-id', id);

        _colorsArray = null;
        _colorsArray = P.BackgroundData.states[id].slice(0).reverse();

        var x = _BGPolyLengthInside - 1;
        while( x >= 0 ){

            _color = _colorsArray[x];
            var el = _BGPolygonsInside[x];

            animateBG( _color, el );

            x--;
        }

        for (var y = _BGPolyLengthOutside - 1;  y >= 0;  y--) {

            _color = _colorsArray[y];
            // Remove Black
            if( _color === '#000000' ) 
                _color = _colorsArray[y+1];

            _BGPolygonsOutside[y].animate({fill: _color}, 500);

        }

        // Once done, send an event
        setTimeout(function(){
            
            changeBackgroundElements( id );

            P.event_aggregator.trigger( 'onchangeBackgroundComplete:' + id );
            P.event_aggregator.trigger( 'onchangeBackgroundCompleteCommon');
            
        }, 510);
        
    }

    function animateBG( _color, _el ){

        setTimeout(function(){
            _el.animate({ fill: _color }, getRandomArbitrary(0, 400), mina.easeout );    
        }, getRandomArbitrary(0, 800) );
        
    }

    //*** GETTERS **//
    function getSNAP(){
        return _SNAP;
    }

    function getBGPolys(){
        return _BGPolygons;
    }

    function getVideoPolys(){
        return _VIDEOPolygons;
    }

    function changeBackgroundElements( id ){
    console.log('changeBackgroundElements');
        // Filters BAckground svg elements to display appropriate ones on the page
        $('.svgelement').each(function(){
            
            $(this).removeClassSVG('isvisible');

            var modules = $(this).attr('data-module');
            
            if ( ( modules.indexOf( ( id+'' ) ) > -1 ) === true ){
                $(this).addClassSVG('isvisible');
            }

        });
    }

     function getSnapClip(){
        return _SNAPCLIP;
    }

    return{
        init:init,
        changeBackground:changeBackground,
        changeBackgroundElements:changeBackgroundElements,
        getSNAP:getSNAP,
        getBGPolys:getBGPolys,
        getSnapClip:getSnapClip,
        getVideoPolys:getVideoPolys
    };

})();   
P.BackgroundIntro = (function(){
    var
        _BGArea1,
        _BGArea2,
        _BGArea3,
        _BGArea4,
        _BGpaths,
        _BGpathsOutside,
        _BGCenterpaths,
        _animation2Timeout,
        _polyanimTimeout,
        _allBGAnimationOrder = [],
        _SNAP;


    function init(){

        _SNAP = P.BackgroundHandler.getSNAP();

        _BGpaths = _SNAP.selectAll("#background #inside path");
        _BGpathsOutside = _SNAP.selectAll("#background #outside path");

        // Animation at the beginning
        _BGCenterpaths = _SNAP.selectAll('#background #poly-33,#background #poly-34,#background #poly-45');

        _BGArea1 = _SNAP.selectAll(
           '#background #poly-20,#background #poly-22,#background #poly-23,#background #poly-58,#background #poly-32'
        );

        _BGArea2 = _SNAP.selectAll(
           '#background #poly-46,#background #poly-43,#background #poly-19,           #background #poly-47,#background #poly-56,#background #poly-42,#background #poly-7,#background #poly-42'
        );

        _BGArea3 = _SNAP.selectAll(
           '#background #poly-25,#background #poly-38,#background #poly-51,           #background #poly-36,#background #poly-48,#background #poly-56,#background #poly-41,#background #poly-19, #background #poly-39, #background #poly-53'
        );

        _BGArea4 = _SNAP.selectAll(
           '#background #poly-29,#background #poly-18,#background #poly-3,           #background #poly-50,#background #poly-63,#background #poly-11,#background #poly-12,#background #poly-14'
        );

        
        _allBGAnimationOrder.push(_BGArea1);
        _allBGAnimationOrder.push(_BGArea2);
        _allBGAnimationOrder.push(_BGArea3);
        _allBGAnimationOrder.push(_BGArea4);

        _animateWebsiteIntro();
        
    }

    function _animateWebsiteIntro(){

        var reversedColorsArray = P.BackgroundData.states[0].reverse(),
            color = '';

        // Fill color the inside Polys
        for (var i = _BGpaths.length - 1; i >= 0; i--) {
            
            color = reversedColorsArray[i];
                
            _BGpaths[i].attr({'opacity': 0}).attr({fill: color});

        };

        // Fill color the outside Polys
        for (var y = _BGpathsOutside.length - 1;  y >= 0;  y--) {

            color = reversedColorsArray[y];
            _BGpathsOutside[y].attr({'opacity': 0}).attr({fill: color});

        }


        // Center
        _BGCenterpaths.forEach( function(elem,i) {

            elem.animate({'opacity': 1},  500, mina.easeIn);

        });

        _animation2Timeout = setTimeout(function(){
            _animateWebsiteIntro2();
        }, 1200);
        

        // Change the flag
        P.Presenter.hasSeenIntro = true;

    }

    function _animateWebsiteIntro2(){

        clearTimeout( _animation2Timeout );

        for (var i = 0; i < _allBGAnimationOrder.length; i++) {
            
            for (var y = 0; y < _allBGAnimationOrder[i].length; y++) {
                
                var delay = ( i + 1 ) * ( y * 40);

                _opacityAnimation( _allBGAnimationOrder[i][y], delay );
            };

            
            if( (i+1) === _allBGAnimationOrder.length && y === _allBGAnimationOrder[i].length ){
                
                setTimeout( function(){
                    _onWebsiteIntroDone();
                }, delay );

            }
            
        }

        
    }

    function _opacityAnimation( elem, delay ){

        _polyanimTimeout = setTimeout(function(){
            elem.attr( {'opacity': 1} );
        }, delay)

    }

    function _onWebsiteIntroDone(){

        clearTimeout( _onWebsiteIntroDone );

        _BGpaths.forEach( function(elem,i) {

            elem.animate({opacity: 1}, 500, mina.easeIn);

        });

        // Fill opacity the outside Polys
        for (var y = _BGpathsOutside.length - 1;  y >= 0;  y--) {

            _BGpathsOutside[y].animate({opacity: 1}, 500, mina.easeIn);

        }

        P.Home.introAnimationNumbers();

    }


    return{
        init:init
    };

})();
P.BackgroundCommon = (function(){

    /***
        Handles global common events on pages
    ****/

    var _SNAPBG,

        _backHomePoly,
        _backHomePolySec,
        _seeMorePoly,
        _seeMoreLayer,
        _layerInfo,

        _$infoText,
        _$moreInfoInside,
        _$moreinfoImages,
        _ButtonCloseMore;

    function init(){

        _SNAPBG = P.BackgroundHandler.getSNAP();

        _backHomePoly = _SNAPBG.select('#background #poly-13');
        _seeMorePoly = _SNAPBG.select('#background #poly-29');

        _ButtonCloseMore = $('.close-info-layer');
        _$infoText = $('.svgelement.info-left');
        _$moreInfoInside = $('.mod-main-module .moreinfo-layer');
        _$moreinfoImages = $('.info-layer-module-image.module3');

        //Layer Info
        _layerInfo = _SNAPBG.select('#info-layer');

        _initEvents();


    }

    function _initEvents(){

        P.event_aggregator.bind( 'onchangeBackgroundCompleteCommon', function(){
    
            _onPageChanged();

        } );
    }

    function _onPageChanged(){

        // Remove all previously attributed elements
        close();

        // Checks in the new page if something has to be binded

        // BACK HOME
        if( $('.mod-main-module.active').length ){
            _initBackHome();
        }


        // SEE MORE
        if( $('.svgelement.info-left.isactivable.isvisible').length ){

            _initSeeMore();

        }

    }
    function _initBackHome(){
        _backHomePoly.attr('cursor', 'pointer');

        _backHomePoly.mouseover(function(e){
            _backHomePoly.animate({opacity:0}, 100);
        })
        .mouseout(function(){
            _backHomePoly.animate({opacity:1}, 300);
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }
            
            $('.mod-main-module.active').find('.home-link').trigger('click');

             // Xiti
            var tag = '';
            if(  P.Config.currentId === 1 ){
                tag = 'picasso_au_cube::si_picasso_etait::picasso3';
            }else if(  P.Config.currentId === 2 ){
                tag = 'picasso_au_cube::si_picasso_me_dessinait::picasso3';
            }else{
                tag = 'picasso_au_cube::si_picasso_m_etait_reinvente::picasso3';
            }

            xt_med('C',xtn2Value,tag,'A');


        });
        
        
    }

    function _initSeeMore(){
            
        _seeMorePoly.attr('cursor', 'pointer');

        _seeMorePoly
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }

            _onSeeMoreOpen();
        });

        _ButtonCloseMore.on('click', function(){
            _onSeeMoreClose();
        });

    }

    function _onSeeMoreOpen(){
        
        _$infoText.addClassSVG('inactive');
        _layerInfo.attr('display', 'block');

        // Switching content
        $('.info-layer-content').removeClassSVG('active');
        $('.info-layer-content.module' + P.Config.currentId ).addClassSVG('active');

        // Module 3 images
        if( P.Config.currentId === 3 ){

            _$moreinfoImages
                .removeClassSVG('active')
                .eq( P.VideoModule.getCurrentId() ).addClassSVG('active');

            $('.section-main-03 .text-under[data-id="'+P.VideoModule.getCurrentId()+'"]').addClass('active');

            // Pause video
            P.YoutubeVideo.pauseVideo();
            
        }

        _$moreInfoInside.addClass('active');
        $('.mod-video').addClass('behind');
        
        P.event_aggregator.trigger( 'onSeeMoreOpen' );

        // Xiti
        var tag = '';
        if(  P.Config.currentId === 2 ){
            tag = 'picasso_au_cube::si_picasso_me_dessinait::popup';
        }else{
            tag = 'picasso_au_cube::si_picasso_m_etait_reinvente::popup';
        }

        xt_med('C',xtn2Value,tag,'A');

    }

    function _onSeeMoreClose(){

        _$infoText.removeClassSVG('inactive');

        $('.info-layer-content').removeClassSVG('active');
        _$moreinfoImages.removeClassSVG('active');
        $('.section-main-03 .text-under').removeClass('active');

        _layerInfo.attr('display', 'none');
        _$moreInfoInside.removeClass('active');

        $('.mod-video').removeClass('behind');

        P.event_aggregator.trigger( 'onSeeMoreClose' );

    }

    function close(){

        console.log('close backgroundcommon');

        _onSeeMoreClose();

        // BACK HOME
        _backHomePoly.attr('cursor', 'default');
        _backHomePoly.attr('opacity', 1);
        
        _backHomePoly.unmouseover();
        _backHomePoly.unmouseout();
        _backHomePoly.unmouseup();

        // SEE MORE
        _seeMorePoly.unmouseup();

        _ButtonCloseMore.off('click');
        _seeMorePoly.attr('cursor', 'default');

    }

    return{
        init:init,
        close:close
    };

})();
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
P.BackgroundAutoModule = (function(){

    var _SNAP,
        _autoBackground,
        _ButtonMore,
        

        _ButtonAllPics,
        _DomButtonAllPics,
        _ButtonAllPicsText,
        _$autoWrapper;

    function init(){        
            
        console.log('Init Background Auto');

        _autoWrapperSVG = $('svg #autoportrait .rect-sizer');

        _autoWrapperSVG.addClassSVG('active');

        _$autoWrapper = $('.mod-auto-wrapper');
        
        _DomButtonAllPics = $('.section-main-02 .info-right');

        _SNAP = P.BackgroundHandler.getSNAP();
        
        _autoBackground = _SNAP.select('#autoportrait #background_1_');
        _autoBackground.attr('display', 'block');

        _ButtonAllPicsText = _SNAP.select('#interactive_layers .info-right');
        _ButtonAllPics = _SNAP.select('#background #poly-38');
        _ButtonAllPics.attr('cursor', 'pointer');

        P.BackgroundHandler.changeBackground( P.Config.currentId );    

        P.event_aggregator.bind( 'onchangeBackgroundComplete:2', function(){

            _initEvents();        

        } );

        P.Resizer.AutoWrapperResize();

    }

    function _initEvents(){

        _ButtonAllPics
        .mouseover(function(e){
            _ButtonAllPics.animate({opacity: 0}, 100);
            _ButtonAllPicsText.attr('fill', '#000000');
        })
        .mouseout(function(){
            _ButtonAllPics.animate({opacity: 1}, 300);
            _ButtonAllPicsText.attr('fill', '#FFFFFF');
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }

            P.PortraitController.showGallery();
        });

        P.event_aggregator.bind( 'onSeeMoreOpen', function(){
            _onSeeMoreOpen();        
        });

        P.event_aggregator.bind( 'onSeeMoreClose', function(){
            _onSeeMoreClose();        
        });

    }

    function _onSeeMoreOpen(){
        
        _$autoWrapper.hide();
        
        _autoBackground.attr('display', 'none');

    }

    function  _onSeeMoreClose(){
        _$autoWrapper.show();
        _autoBackground.attr('display', 'block');
    }

    function close(){
        
        console.log('close backgroundAutoModule');

        _autoWrapperSVG.removeClassSVG('active');
        
        _ButtonAllPics.unmouseover();
        _ButtonAllPics.unmouseout();
        _ButtonAllPics.unmouseup();
        _ButtonAllPics.attr('cursor', 'default');
        _ButtonAllPics = null;

        _autoBackground.attr('display', 'none');

        P.event_aggregator.unbind( 'onchangeBackgroundComplete:2');
        P.event_aggregator.unbind( 'onSeeMoreOpen');
        P.event_aggregator.unbind( 'onSeeMoreClose');

    }

    return{
        init:init,
        close:close
    };

})();
P.BackgroundHome = (function(){

    var _SNAP,
        _ButtonChoisir,
        _ButtonValidate,
        _ButtonArteLink,
        _ButtonBoutiqueLink,
        _$ButtonChoose,
        _numsSVG = [];

    function init(){        

        console.log('Background Home init');

        _SNAP = P.BackgroundHandler.getSNAP();
        _ButtonChoisir = _SNAP.select('#background path#poly-25');
        _ButtonArteLink = _SNAP.select('#background path#poly-2');
        _ButtonBoutiqueLink = _SNAP.select('#background path#poly-28');

        _$ButtonChoose = $('#svg svg #background #poly-25');
        
        _ButtonValidate = _SNAP.select('.mainpage-validate-button');

        _numsSVG.push(_SNAP.select('.mainpage-number.number-01'));
        _numsSVG.push(_SNAP.select('.mainpage-number.number-02'));
        _numsSVG.push(_SNAP.select('.mainpage-number.number-03'));


        // If first time, we launch the intro and wait until the end
        if( P.Config.isFirstTime === true ){

            P.BackgroundHandler.changeBackgroundElements(0);
            $('.section-footer').attr('data-id', "0");

            // Hide the elements
            $('.mainpage-validate-button, .mainpage-number, .mainpage-subtitle, .mainpage-link-special, .mainpage-link-boutique, .mainpage-choose-button').removeClassSVG('isvisible');

            P.BackgroundIntro.init();

            P.Config.isFirstTime = false;

        }else{
            
            P.BackgroundHandler.changeBackground( 0 );

        }

        // One or another
        P.event_aggregator.bind( 'onHomeIntroComplete', function(){

            _initEvents();        

        });

        P.event_aggregator.bind( 'onchangeBackgroundComplete:0', function(){

            _initEvents();        

        });

        _$ButtonChoose.addClassSVG('ishome');

    }

    //** Initialises events and color selction **/
    function _initEvents(){
        // Show the elements on the page
        $('.mainpage-title, .mainpage-validate-button, .mainpage-number, .mainpage-subtitle, .mainpage-link-special, .mainpage-link-boutique, .mainpage-choose-button').addClassSVG('isvisible');

        _ButtonChoisir.attr('cursor', 'pointer');
        _ButtonArteLink.attr('cursor', 'pointer');
        _ButtonBoutiqueLink.attr('cursor', 'pointer');

        // Events
        _ButtonChoisir.mouseover(function(){
            _ButtonChoisir.animate({opacity: 0}, 100);
            $('.mainpage-choose-button').addClassSVG('ishover');
        })
        .mouseout(function(){
            _ButtonChoisir.animate({opacity: 1}, 300);
            $('.mainpage-choose-button').removeClassSVG('ishover');
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }

            P.Home.onChooseClick();
        });

        _ButtonArteLink.mouseover(function(){
            _ButtonArteLink.animate({opacity: 0.5}, 150);
        })
        .mouseout(function(){
            _ButtonArteLink.animate({opacity: 1}, 300);
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }

            $('.footer-element.elem-2')[0].click();
        });

        _ButtonBoutiqueLink.mouseover(function(){
            _ButtonBoutiqueLink.animate({opacity: 0.5}, 100);
        })
        .mouseout(function(){
            _ButtonBoutiqueLink.animate({opacity: 1}, 300);
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }
            $('.mainpage-link-boutique-link')[0].click();

        });

        _ButtonValidate.mouseover(function(){
            _ButtonValidate.stop().animate( { transform:'s1.3 1.3' }, 200, mina.easeout );
        })
        .mouseout(function(){
            _ButtonValidate.stop().animate( { transform:'s1 1' }, 400, mina.easein );
        })

    }


    function onChooseClick( id ){

        _numsSVG.forEach(function (elem){
            elem.stop();
        });

        _numsSVG[ id ].animate({y:230}, 300);

        // Celui d'avant remonte
        if( ( id - 1 ) >= 0) {
            _numsSVG[ id - 1 ].animate({y:140}, 300);
        }

        if( ( id - 2 ) >= 0 ) {
            _numsSVG[ id - 2 ].attr({y:320});
        }

        if( id === 0 ){
            _numsSVG[ 2 ].animate({y:140}, 300);
        }

        // Celui d'apres se met en-dessous
        if( ( id + 1 ) <= 2 ) {
            _numsSVG[ id + 1 ].attr({y:320});
        }

    }

    function close(){
        console.log('--> Background Home Close');

        _ButtonChoisir.attr('opacity', 1);
        _ButtonChoisir.unmouseover();
        _ButtonChoisir.unmouseout();
        _ButtonChoisir.unmouseup();
        _ButtonChoisir.untouchstart();
        _ButtonChoisir.attr('cursor', 'default');

        _ButtonArteLink.attr('opacity', 1);
        _ButtonArteLink.unmouseover();
        _ButtonArteLink.unmouseout();
        _ButtonArteLink.unmouseup();
        _ButtonArteLink.untouchstart();
        _ButtonArteLink.attr('cursor', 'default');

        _ButtonBoutiqueLink.attr('opacity', 1);
        _ButtonBoutiqueLink.unmouseover();
        _ButtonBoutiqueLink.unmouseout();
        _ButtonBoutiqueLink.unmouseup();
        _ButtonBoutiqueLink.untouchstart();
        _ButtonBoutiqueLink.attr('cursor', 'default');

        _ButtonChoisir = null;
        _ButtonArteLink = null;
        _ButtonBoutiqueLink = null;

        P.event_aggregator.unbind('onHomeIntroComplete' );
        P.event_aggregator.unbind('onchangeBackgroundComplete:0' );

        _$ButtonChoose.removeClassSVG('ishome');

    }

    return{
        init:init,
        onChooseClick:onChooseClick,
        close:close
    };

})();
P.BackgroundVideoModule = (function(){

    var _SNAP,
        _ButtonAllFilms,
        _DomButtonAllFilms;


    function init(){        
        
        console.log('Init Background VideoModule');

        _SNAP = P.BackgroundHandler.getSNAP();
        
        _ButtonAllFilms = _SNAP.select('#background path#poly-50');
        _ButtonAllFilms.attr('cursor', 'pointer');

        _DomButtonAllFilms = $('.mod-main-module.active .see-all-button');

        P.BackgroundHandler.changeBackground( P.Config.currentId );    
        
        P.event_aggregator.bind( 'onchangeBackgroundComplete:' + P.Config.currentId, function(){

            _initEvents();        

        } );

    }

    function _initEvents(){

        _ButtonAllFilms
        .mouseover(function(){
            _ButtonAllFilms.animate({opacity:0}, 100);
            _DomButtonAllFilms.addClass('active');
        })
        .mouseout(function(){
            _ButtonAllFilms.animate({opacity: 1 }, 300);
            _DomButtonAllFilms.removeClass('active');
        })
        .mouseup(function(e){

            if (e.type === 'touchend') {
                
                e.stopPropagation();
                e.preventDefault();
            }

            $('.mod-main-module.active .see-all-button').trigger('click');
        });

    }


    function close(){

        console.log('remove BackgroundVideoModule');

        P.event_aggregator.unbind( 'onchangeBackgroundComplete' + P.Config.currentId, null, this );

        P.BackgroundCommon.close();

        _ButtonAllFilms.attr('cursor', 'default');
        _ButtonAllFilms.attr('opacity', 1);
        _ButtonAllFilms.unmouseover();
        _ButtonAllFilms.unmouseout();
        _ButtonAllFilms.unmouseup();

        
    }

    return{
        init:init,
        close:close
    };

})();
var P = P || {};
P.Config = {

    LANG : "",
    // Change during execution
    isFirstTime : false,
    isFirstTimeVideoModule : true,
    currentId : 0,
    isDebug : true,
    isTouchDevice: false

};
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
P.FullscreenHandler = (function(){

    var _isFullscreen;

    function init(){

        _isFullscreen = false;
        
        $('.footer-element-fs').on('click', function(){
            
            if( _isFullscreen === false ){
                _isFullscreen = true;
                _launchFullScreen(document.documentElement);
            }
            else{
                _isFullscreen = false;
                _removeFullScreen();
            }
        });

    }

    function _launchFullScreen( element ){
        if(element.requestFullscreen) {
            element.requestFullscreen();
          } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
          } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
          } else if(element.msRequestFullscreen) {
            element.msRequestFullscreen();
          }

          $('#arte-header').hide();
          $('.content-wrapper').addClass('isfullscreen');
          
    }

    function _removeFullScreen(){
        
         if(document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if(document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }

        $('#arte-header').show();
        $('.content-wrapper').removeClass('isfullscreen');

    }

    function getIsFullscreen(){
        return _isFullscreen;
    }

    return{
        init:init,
        getIsFullscreen:getIsFullscreen
    };

})();
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

        P.BackgroundHome.onChooseClick( _currentId );

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
/***********************
    @author Aurelien G.
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

        detectDevice();

        P.DataHandler.init();

        P.BackgroundHandler.init();

        P.RouterEvents.init();

        P.Resizer.init();
        
        P.VideoWrapper.init();

        P.YoutubeVideo.init();
        
        P.Social.init();

        P.Footer.init();

        P.Storage.init();

        P.AppRouter = new P.Router();

        Backbone.history.start({ pushState: 'pushState' in window.history });
        // Backbone.history.start({ pushState: 'pushState' in window.history , root: '/picasso/build/'});
        // Backbone.history.start({ pushState: 'pushState' in window.history, root: '/_GUEST/picasso/' });
    }

    function detectDevice(){

        P.Config.isTouchDevice = navigator.userAgent.match(/iPad/i) != null;
        
        if ( P.Config.isTouchDevice === true ){
            $('svg').removeAttr('preserveAspectRatio');
        }

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
        _$svg,
        _WH = 0,
        _WW = 0,

        _$content,
        _$autoLeft,
        _$canvases,
        _$autoLeft,

        _SVGRATIO = 1368/868,

        _autoLeftWnum,
        _autoLeftHnum,
		
		_autoWrapperSVG;

    function init(){

        _$content = $('.content-wrapper');
        _$autoLeft = $('.mod-auto-step.step-facechange .mod-auto-left');
        _$canvases = $('#canvasvideo, #offcanvas');
        _$autoWrapper = $('.mod-auto-wrapper');

        _$svg = $('#svg');
		
		_autoWrapperSVG = $('svg #autoportrait .rect-sizer');

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

        // BG
        if( _$content.hasClass('isfullscreen') ){
            _$content.css('height', '100%');
        }else{
            _$content.css('height', contentHeight + "px"  );    
        }
        
        P.Portrait.initalize_app( true );

        resizeSVG();

        // Resize list views in VideoModule
       	P.VideoModule.resizeList();

       	AutoWrapperResize();

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

    function resizeSVG(){

        // Background 
        
        if(  !P.BackgroundHandler.getSNAP() ) return;

        if(   _WW > 1100  && _WH > 630 ){

            if( ( _WW / _WH ) > _SVGRATIO ) {
                P.BackgroundHandler.getSNAP().attr('preserveAspectRatio', '');
                P.BackgroundHandler.getSnapClip().attr('preserveAspectRatio', '');

                $('html').addClass('no-ratio');

            }

        }else{
            P.BackgroundHandler.getSNAP().attr('preserveAspectRatio', 'xMinYMin slice');
            P.BackgroundHandler.getSnapClip().attr('preserveAspectRatio', 'xMinYMin slice');
            $('html').removeClass('no-ratio');
        }


    }

    function AutoWrapperResize(){
        
        _$autoWrapper.css({
            left: parseInt(_autoWrapperSVG.offset().left, 10) + 'px',
            top: parseInt(_autoWrapperSVG.offset().top - 100, 10) + 'px'
        });
        
    }

    return{
        init:init,
        canvasSizes:canvasSizes,
        resizeSVG:resizeSVG,
        AutoWrapperResize:AutoWrapperResize
    };

})();
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
        xt_med('C',xtn2Value,'picasso_au_cube::si_picasso_etait','N');
    },

    second : function() {
        this.presenter.showModule( 2 );
        xt_med('C',xtn2Value,'picasso_au_cube::si_picasso_me_dessinait','N');
    },

    third : function() {
        this.presenter.showModule( 3 );
        xt_med('C',xtn2Value,'picasso_au_cube::si_picasso_m_etait_reinvente','N');
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
        $( document ).on('click', 'a[href^="/"]', function(event) {

            var href, passThrough, url;
            href = $(event.currentTarget).attr('href');
            // passThrough = href.indexOf('sign_out') >= 0;
            if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
                event.preventDefault();
                url = href.replace('/', '');

                url = lang + '/' + url;

                if(P.FullscreenHandler.getIsFullscreen() === false){
                    P.AppRouter.navigate(url, {
                        trigger: true
                    });
                }else{
                    P.Presenter.prototype.call( url );
                }
                
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

    var _$footerFB,
        _$footerTW,
        _$footerG;

    function init(){

        _$footerFB = $('.footer-element-social.elem-6 a');
        _$footerTW = $('.footer-element-social.elem-7 a');
        _$footerG = $('.footer-element-social.elem-8 a');

        $.ajaxSetup({ cache: true });
        $.getScript('//connect.facebook.net/fr_FR/all.js', function(){
            
            FB.init({
                appId      : '263786353803104',
                status     : true, // check login status
                cookie     : true, // enable cookies to allow the server to access the session
                xfbml      : true  // parse XFBML
            });

        });

        _initEvents();
    }

    function _initEvents(){

        // _$footerFB.on('click', function(){
        //     _onFBShare();
        // });

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

        // GET URL OF THE PICTURE
        get_short_url(source, function( image_url ){

            get_short_url(document.URL, function( source ) {

                var twDatas =[
                    encodeURIComponent( source ),
                    encodeURIComponent(P.DataHandler.data.social.twitter_autoportrait + ' - ' + image_url)
                ];

                var twLink = 'https://twitter.com/intent/tweet?text='+ twDatas[1] +'&url='+ twDatas[0];

                window.open(twLink);

            });

        })
    }

    function _onGShare( id ){

        var gLink = "https://plus.google.com/share?url=" + encodeURIComponent( document.URL );

        _$footerG.attr('href', gLink);

    }

    function refreshLinks( id ){

        if( P.DataHandler.isLoaded === true ){
                    _onFBShare( id );
                    _onTWShare( id );
                    _onGShare( id );
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
        _initEvents();
    }

    function _initEvents(){

        P.event_aggregator.bind( 'onOverlayClicked', function(){
            
            P.VideoWrapper.toggleVideoWrapper( 'hide' );
            onVideoClose();
        });

    }

    function onVideoLaunch( _id ){

        $('.section-main-allvideos .video-name').removeClass('active');
        $('.section-main-allvideos .video-name[data-youtubeid="'+_id+'"]').addClass('active');
        $('.section-main-allvideos .page-title').addClass('inactive');

    }

    function onVideoClose(){


        $('.section-main-allvideos .video-name').removeClass('active');
        $('.section-main-allvideos .page-title').removeClass('inactive');

    }

    function close(){
        console.log('Close VideoAllModule');

        P.event_aggregator.unbind( 'onOverlayClicked' );
        P.VideoWrapper.toggleVideoWrapper( 'hide' );

    }

    return{
        init:init,
        onVideoLaunch:onVideoLaunch,
        onVideoClose:onVideoClose,
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

        _demoCounter = 0;
        _isFirstRoulette = true;

        _arrayIdSeen  = [];

        _$listItem = $('.section-main.active header li');
        _$listWrapper = $('.section-main.active header ul');
        _$relaunchBtn = $('.action-button.button-relaunch');
        _$videoPlayButton = $('.video-play-button');

        P.VideoWrapper.toggleVideoWrapper('show');

        _max = _$listItem.length;

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
        if( _demoCounter === 3 ){
            P.Config.isFirstTimeVideoModule = false;
        }

        if( _demoCounter === 4 ){
            P.VideoWrapper.toggleVideoWrapper('show');
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

        // Check if already seen
        _currentId = nextId;

        if( P.Config.isFirstTimeVideoModule === false ){

            if( _arrayIdSeen.length === _max ){
                _arrayIdSeen.length = 0;
            }

            if( _arrayIdSeen.indexOf( _currentId ) > -1 ){
                console.log(_currentId + " Already seen, Next");
                _onRandomRoulette();
                return;

            }else{

                _arrayIdSeen.push( _currentId );
                console.log('--> Video ' + _arrayIdSeen);
            }

        }

        _changeWheel();

        // Xiti
        var tag = '';
        if(  P.Config.currentId === 1 ){
            tag = 'picasso_au_cube::si_picasso_etait::relancer';
        }else{
            tag = 'picasso_au_cube::si_picasso_m_etait_reinvente::relancer';
        }

        xt_med('C',xtn2Value,tag,'A');

    }

    function initPosition( ){

        _wrapperHeight = _$listWrapper.outerHeight();
        _catHeight = _$listItem.outerHeight();
        
        _currentId = parseInt( ( (_$listItem.length/2) - 1 ) , 10);

        resizeList();
        
        _onRandomRoulette();
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

        P.BackgroundHandler.showAllVideo();

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

        if( state === 'show' ){
            setTimeout(function(){
                _$videoWrapper.addClass('active');    
            }, 1000);
        }
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
        if( _player ){

            _player.destroy();
            $('.mod-video iframe').unbind().remove();
            // $('.mod-video').append('<div id="player"></div>');
            _player = null;

        }

        _player = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: id,
            playerVars: {
                controls:1,
                showinfo:0,
                modestbranding: 1
            },
            events: {
              'onReady': _onPlayerReady,
              'onStateChange': _onPlayerStateChange
            }
        });

        P.VideoWrapper.toggleVideoWrapper( 'show' );
    }

    function onYouTubeIframeAPIReady(){

        _isAPILoaded = true;
        // _onPlayerReady();

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