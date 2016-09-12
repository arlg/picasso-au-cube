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