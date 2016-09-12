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