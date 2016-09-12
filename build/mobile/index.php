<?php

function getDefaultLanguage() {
   if (isset($_SERVER["HTTP_ACCEPT_LANGUAGE"]))
      return parseDefaultLanguage($_SERVER["HTTP_ACCEPT_LANGUAGE"]);
   else
      return parseDefaultLanguage(NULL);
}
function parseDefaultLanguage($http_accept, $deflang = "fr") {
   if(isset($http_accept) && strlen($http_accept) > 1)  {
      $x = explode(",",$http_accept);
      foreach ($x as $val) {
         if(preg_match("/(.*);q=([0-1]{0,1}\.\d{0,4})/i",$val,$matches))
            $lang[$matches[1]] = (float)$matches[2];
         else
            $lang[$val] = 1.0;
      }
      #return default language (highest q-value)
      $qval = 0.0;
      foreach ($lang as $key => $value) {
         if ($value > $qval) {
            $qval = (float)$value;
            $deflang = $key;
         }
      }
   }
   return strtolower($deflang);
}

?><?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

/**************************
     Lang detection
***********************/

$base = dirname($_SERVER['PHP_SELF']) . '/';
if($base == '//') $base = '/';

$domainURL = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https' : 'http') . '://' . $_SERVER['SERVER_NAME'];

$requestParts = explode('?', $_SERVER["REQUEST_URI"]);
$baseFullPath = array_shift($requestParts);

$fullPath = substr($baseFullPath, strlen($base));

$pathSlices = explode('/', $fullPath, 2);

if( isset($pathSlices[0]) ){
  $LANG = $pathSlices[0];
}else if( isset($pathSlices[1]) ){
  $LANG = $pathSlices[1];
}

// If no lang in the url
if( $LANG === "" ){

  // Look into the GET
  $LANG = isset($_GET['lang']) ? $_GET['lang'] : "";

  // If nothing, gets it on server
  if( $LANG === "" ){

      $LANG = getDefaultLanguage();
      $LANG = explode('-', $LANG);
      $LANG = $LANG[0];
      if( $LANG === "en" ) $LANG = "fr";

  }

  $redirection = $domainURL . $base. $LANG;
  header('HTTP/1.0 308 Permanent Redirect');
  header('Location: ' . $redirection);
  exit();

}

$BASE_URL_WITH_LANG = ($domainURL . $base . $LANG);

// LOCAL - Direct url
$base = '../../';

// PRE-PROD
// $base = 'http://www.arlg.me/_GUEST/picasso/';

// Entry point of the app
require_once '../vendor/autoload.php';

$loader = new Twig_Loader_Filesystem('templates');
$twig = new Twig_Environment($loader
    // , array(
    // 'cache' => 'compilation_cache',
// )
);

$contents = glob("../img/userportraits/*.{jpg,png,gif}", GLOB_BRACE);
$twig->addGlobal('baseurl', $base);
$twig->addGlobal('contents', $contents);
// <- No Cache for now



/**************************
     JSON CONTENT
***********************/

//// -> JSON CONTENT
$json_file = "../data/arte_picasso_".$LANG.".json";
$json_raw = file_get_contents($json_file);
$json = json_decode($json_raw, true);
//// -> END

require_once '../php/facebookcheck.php';

?>
<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" xmlns:og="http://ogp.me/ns#"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        
        <title><?php echo($json["website"]["title"]); ?></title>
        <meta name="description" content="<?php echo($json["website"]["description"]); ?>">
        <meta name="keywords" content="<?php echo($json["website"]["keywords"]); ?>">
        <meta name="author" content="Aurelien Gantier - www.arlg.me">


        <!-- MOBILE -->
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui" />
        <meta name="apple-mobile-web-app-capable" content="yes">
        
        <!-- FB stuff -->
        <meta property="og:title" content="Picasso">
        <meta property="og:url" content="<?php echo($BASE_URL_WITH_LANG); ?>">
        <meta property="og:image" content="<?php echo($domainURL); ?>/img/share/share.jpg">
        <meta property="og:site_name" content="Picasso">
        <meta property="og:description" content="Description">
        <meta property="og:type" content="website"/>


        <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->

        <link href='http://fonts.googleapis.com/css?family=Economica:400,700' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href="<?php echo($base); ?>mobile/css/styles.css">
        <script src="<?php echo($base); ?>js/vendor/modernizr-2.6.2.min.js"></script>

        <!-- <script src="//localhost:35729/livereload.js"></script> -->
    </head>
    <body>

        <?php 

            echo $twig->render('body.html', $json);

        ?>
        
        <script src="<?php echo($base); ?>js/plugins.js" type="text/javascript"></script>
        <script src="<?php echo($base); ?>mobile/js/vendor/hammer.js" type="text/javascript"></script>
        <!-- JSFEAT -->
        <script src="<?php echo($base); ?>js/vendor/jsfeat.js" type="text/javascript"></script>
        <script src="<?php echo($base); ?>js/vendor/frontalface.js" type="text/javascript"></script>
        <script src="<?php echo($base); ?>js/vendor/compatibility.js" type="text/javascript"></script>
        <script src="<?php echo($base); ?>js/vendor/datgui.js" type="text/javascript"></script>
        
        <script type="text/javascript">
            var lang = '<?php echo($LANG); ?>', // fr / de
                base  = '<?php echo($base); ?>', // / or nothing
                domain = '<?php echo($domainURL); ?>'; // picasso.arte/com
                site = '<?php echo($BASE_URL_WITH_LANG); ?>'; // picasso.arte.com/fr / de
        </script>

        <!-- ARLG scripts -->
        <script src="<?php echo($base); ?>/mobile/js/P.js" type="text/javascript"></script>
      

        <!-- SOCIAL -->
        <script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>
        

    </body>
</html>