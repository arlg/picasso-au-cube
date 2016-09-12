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